import React from "react";
import styles from "./Auth.module.css";

const Auth = () => {
  return (
    <>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Регистрация</h1>
        <div className={styles.register}>
          <form className={styles.register__form}>
            <div className={styles.register__statusInputs}>
              <label>
                <input
                  className={styles.register__statusInput}
                  type="radio"
                  name="options"
                  value="customer"
                  // checked={selectedOption === 'option1'}
                  // onChange={handleOptionChange}
                />
                Я заказчик
              </label>
              <label>
                <input
                  type="radio"
                  name="options"
                  value="freelancer"
                  // checked={selectedOption === 'option2'}
                  // onChange={handleOptionChange}
                />
                Я фрилансер
              </label>
            </div>
            <div className={styles.register__nameInputs}>
            <input className={styles.register__nameInput} type="text" />
            <input className={styles.register__nameInput} type="text" />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth;
