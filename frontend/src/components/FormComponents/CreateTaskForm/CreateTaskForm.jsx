import React, { useState, useEffect } from 'react';
import { useFormAndValidation } from '../../../hooks/useFormAndValidation';
import { industryAndCategoryOptions } from '../../../utils/constants';
import { InputText } from '../../InputComponents/InputText/InputText';
import { InputSelect } from '../../InputComponents/InputSelect/InputSelect';
import { InputTags } from '../../InputComponents/InputTags/InputTags';
import { InputDocument } from '../../InputComponents/InputDocument/InputDocument';
import { InputSwitch } from '../../InputComponents/InputSwitch/InputSwitch';
import { Button } from '../../Button/Button';
import './CreateTaskForm.css';

// const MAX_ATTACHED_DOCS = 8;

function CreateTaskForm({ onSubmit }) {
  const { values, errors, isValid, handleChange, setValues, setErrors } = useFormAndValidation();
  const [isChecked, setIsChecked] = useState({
    budgetDiscussion: false,
    deadlineDiscussion: false,
  });
  const [document, setDocument] = useState(null);
  const [tags, setTags] = useState([]);
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allTaskValues, setAllTaskValues] = useState([]);

  function addDocument(items) {
    setDocument(items);
  }

  // временное решение: сохранение значений формы в локальное хранилище
  // для сохранения нескольких заказов в одном файле
  // необходимо не выходя из страницы создания заказа, сделать два заказа
  useEffect(() => {
    const taskValues = JSON.stringify(allTaskValues);
    localStorage.setItem('taskValues', taskValues);
  }, [allTaskValues]);

  function handleBudget(event) {
    setBudget(event.target.value);
  }

  function handleDeadline(event) {
    setDeadline(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    let allValues = {
      ...values,
      stacks: tags,
      budgetDiscussion: isChecked.budgetDiscussion,
      deadlineDiscussion: isChecked.deadlineDiscussion,
      // orderId: Math.floor(Math.random() * 100) + 1,
      // orderCreationDate: new Date().toString().split(':').slice(0, 2).join(':'),
      file: document,
    };

    if (!isChecked.budgetDiscussion) {
      allValues.budget = { budget };
    } else if (!isChecked.deadlineDiscussion) {
      allValues.deadline = { deadline };
    }

    if (!isChecked.budgetDiscussion && !isChecked.deadlineDiscussion) {
      allValues.budget = { budget };
      allValues.deadline = { deadline };
    }

    // setAllTaskValues([allValues, ]);
    onSubmit(allValues);
  };

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <div>
        <p className="create-task-form__input-text">Название заказа</p>
        <InputText
          type="text"
          placeholder="Кратко опишите суть задачи"
          name="task_name"
          width={610}
          onChange={handleChange}
          value={values.task_name || ''}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Специализация</p>
        <InputSelect
          placeholder="Выберите из списка"
          name="activity"
          options={industryAndCategoryOptions}
          value={values.activity || ''}
          error={errors.activity}
          errorMessage={errors.activity}
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Навыки</p>
        <InputTags name="stacks" tags={tags} setTags={setTags} />
      </div>
      <div>
        <p className="create-task-form__input-text">Бюджет</p>
        <InputText
          isDisabled={isChecked.budgetDiscussion}
          type="number"
          placeholder="Бюджет"
          name="budget"
          width={295}
          onChange={handleBudget}
          value={budget || ''}
        />
      </div>
      <InputSwitch
        type="checkbox"
        name="budgetDiscussion"
        label="Жду предложений от фрилансеров"
        marginTop={12}
        // onChange={handleChange}
        checked={isChecked.budgetDiscussion}
        onChange={() => {
          setIsChecked((previous) => ({
            ...previous,
            budgetDiscussion: !previous.budgetDiscussion,
          }));
        }}
      />
      <div>
        <p className="create-task-form__input-text">Сроки</p>
        <div className="create-task-form__input-year-wrapper">
          <InputText
            type="date"
            placeholder="Окончание"
            name="deadline"
            width={295}
            onChange={handleDeadline}
            value={deadline || ''}
            isDisabled={isChecked.deadlineDiscussion}
          />
        </div>
      </div>
      <InputSwitch
        type="checkbox"
        name="deadlineDiscussion"
        label="Жду предложений от фрилансеров"
        marginTop={12}
        // onChange={handleChange}
        checked={isChecked.deadlineDiscussion}
        onChange={() => {
          setIsChecked((previous) => ({
            ...previous,
            deadlineDiscussion: !previous.deadlineDiscussion,
          }));
        }}
      />
      <div>
        <p className="create-task-form__input-text">Описание</p>
        <InputText
          type="textarea"
          placeholder="Опишите задачу подробнее"
          name="about"
          width={610}
          height={150}
          onChange={handleChange}
          value={values.about || ''}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Загрузить файл</p>
        <div className="create-task-form__input-doc-wrapper">
          <InputDocument name="portfolio" onChange={addDocument} />
        </div>
      </div>

      <Button text="Опубликовать заказ" width={289} marginTop={60} marginBottom={200} />
    </form>
  );
}

export { CreateTaskForm };
