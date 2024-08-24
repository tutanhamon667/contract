from openai import OpenAI


import os
import subprocess
import requests
client = OpenAI(api_key="sk-B8LJGG6sthezGXsbGBvMLl1-4lud19ykoPmyfC8357T3BlbkFJYy32pRA3tjaPfRTZrcACo3tGZUEieq6jHCQJIXYPkA")

def generate_code(prompt, model="babbage-002", max_tokens=100, temperature=0.7):
    response = client.completions.create(model=model,
    prompt=prompt,
    max_tokens=max_tokens,
    temperature=temperature)
    code = response.choices[0].text.strip()
    return code

def execute_code(code):
    try:
        with open("temp_code.py", "w") as f:
            f.write(code)

        result = subprocess.run(
            ["python", "temp_code.py"], capture_output=True, text=True
        )

        os.remove("temp_code.py")

        return result.stdout, result.stderr
    except Exception as e:
        return str(e), None

def correct_code(error_message, original_prompt, model="text-davinci-003"):
    correction_prompt = f"{original_prompt}\n\nВозникла следующая ошибка при выполнении кода:\n{error_message}\n\nМожешь ли ты исправить код, чтобы эта ошибка не возникала?"
    return generate_code(correction_prompt, model)

def search_stackoverflow(error_message):
    query = f"[python] {error_message}"
    url = f"https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q={query}&site=stackoverflow"
    response = requests.get(url)
    results = response.json().get('items', [])

    if results:
        # Retrieve the most relevant answer
        answer_id = results[0]['accepted_answer_id']
        answer_url = f"https://api.stackexchange.com/2.3/answers/{answer_id}?order=desc&sort=activity&site=stackoverflow&filter=withbody"
        answer_response = requests.get(answer_url)
        answer_data = answer_response.json().get('items', [])[0]
        return answer_data['body']
    return "No relevant answers found on Stack Overflow."

if __name__ == "__main__":
    prompt = "Напиши функцию на Python, которая вычисляет факториал числа."
    code = generate_code(prompt)

    max_attempts = 5
    for attempt in range(max_attempts):
        print(f"Попытка {attempt+1}:\nСгенерированный код:\n{code}\n")

        stdout, stderr = execute_code(code)
        if stderr:
            print(f"Ошибка выполнения:\n{stderr}\n")
            if attempt == 2:  # After 3rd attempt
                print("Ищу решение на Stack Overflow...")
                solution = search_stackoverflow(stderr)
                print(f"Решение найдено на Stack Overflow:\n{solution}\n")
            code = correct_code(stderr, prompt)
        else:
            print(f"Результат выполнения:\n{stdout}\n")
            break