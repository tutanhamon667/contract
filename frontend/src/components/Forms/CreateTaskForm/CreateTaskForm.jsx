import InputText from '../../Inputs/InputText/InputText';
import InputMultipleSelect from '../../Inputs/InputMultipleSelect/InputMultipleSelect';
import InputTags from '../../Inputs/InputTags/InputTags';
import { InputDoc } from '../../Inputs/InputDoc/InputDoc';
import Button from '../../Button/Button';
import React, { useState, useEffect } from 'react';
import './CreateTaskForm.css';
import { industryOptions } from '../../../utils/constants';
import useFormAndValidation from '../../../hooks/useFormAndValidation';
import { InputSwitch } from '../../Inputs/InputSwitch/InputSwitch';

const MAX_ATTACHED_DOCS = 8;

function CreateTaskForm() {
  const [docKeys, setDocKeys] = useState([Date.now()]);
  const { values, errors, isValid, handleChange, setValues, setErrors } = useFormAndValidation();
  const [activityValues, setActivityValues] = useState([]);
  const [stacksValues, setStacksValues] = useState([]);
  const [isChecked, setIsChecked] = useState({
    budgetDiscussion: false,
    deadlineDiscussion: false
  });
  const [allTaskValues, setAllTaskValues] = useState([])

  // временное решение: сохранение значений формы в локальное хранилище
  // для сохранения нескольких заказов в одном файле
  // необходимо не выходя из страницы создания заказа, сделать два заказа
  useEffect(() => {
    const taskValues = JSON.stringify(allTaskValues)
    localStorage.setItem('taskValues', taskValues)
  }, [allTaskValues])
  // -------------------------------------------------------------------

  const handleDocChange = (event) => {
    if (event.currentTarget.files[0]) {
      setDocKeys(prevKeys => [...prevKeys, Date.now()]);
    }
  };

  const onDeleteDocClick = (key) => {
    setDocKeys(prevKeys => prevKeys.filter(prevKey => prevKey !== key));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const allValues = {
      ...values,
      direction: activityValues,
      stacks: stacksValues,
      budgetDiscussion: isChecked.budgetDiscussion,
      deadlineDiscussion: isChecked.deadlineDiscussion,
      orderId: Math.floor(Math.random() * 100) + 1,
      orderCreationDate: new Date().toString().split(":").slice(0, 2).join(":"),
    }

    setAllTaskValues([...allTaskValues, allValues])
  };

  // console.log(new Date().toString());

  const dateString = "Tue Oct 24 2023 23:46:30 GMT+0600 (Kyrgyzstan Time)";
  const trimmedDateString = dateString.split(":").slice(0, 2).join(":");
  // console.log(dateString.split(":"));
  // console.log(dateString.split(":").slice(0, 2));
  // console.log(trimmedDateString);

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <label>
        <p className="create-task-form__input-text">Название заказа</p>
        <InputText
          type="text"
          placeholder="Кратко опишите суть задачи"
          name="task_name"
          width={610}
          onChange={handleChange}
          value={values.task_name || ''}
        />
      </label>
      <label>
        <p className="create-task-form__input-text">Специализация</p>
        <InputMultipleSelect
          name="activity"
          options={industryOptions}
          setActivityValues={setActivityValues}
        />
      </label>
      <label>
        <p className="create-task-form__input-text">Навыки</p>
        {/* TODO: исправить работу тегов также, как на странице просмотра профиля */}
        {/*<InputTags*/}
        {/*  name="stacks"*/}
        {/*  setStacksValues={setStacksValues}*/}
        {/*/>*/}
      </label>
      <label>
        <p className="create-task-form__input-text">Бюджет</p>
        <InputText
          type="number"
          placeholder="Бюджет"
          name="budget"
          width={295}
          onChange={handleChange}
          value={values.budget || ''}
        />
      </label>
      <InputSwitch type="checkbox" name="budgetDiscussion" label="Жду предложений от фрилансеров" marginTop={12}
                   // onChange={handleChange}
                   checked={isChecked.budgetDiscussion}
                   onChange={() => {
                     setIsChecked((prev) => ({
                       ...prev,
                       budgetDiscussion: !prev.budgetDiscussion
                     }))
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
            onChange={handleChange}
            value={values.deadline || ''}
          />
        </div>
      </div>
      <InputSwitch type="checkbox" name="deadlineDiscussion" label="Жду предложений от фрилансеров" marginTop={12}
                   // onChange={handleChange}
                   checked={isChecked.budgetDiscussion}
                   onChange={() => {
                     setIsChecked((prev) => ({
                       ...prev,
                       budgetDiscussion: !prev.budgetDiscussion
                     }))
                   }}
      />
      <label>
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
      </label>
      <div>
        <p className="create-task-form__input-text">Загрузить файл</p>
        <div className="create-task-form__input-doc-wrapper">
          {docKeys.slice(0, MAX_ATTACHED_DOCS).map((key) => (
            <InputDoc
              key={key}
              name="portfolio"
              onChange={(event) => handleDocChange(event, key)}
              onDeleteDocClick={() => onDeleteDocClick(key)}
            />
          ))}
        </div>
      </div>

      <Button
        text="Опубликовать заказ"
        width={289}
        marginTop={60}
        marginBottom={200}>
      </Button>
    </form>
  );
}

export { CreateTaskForm };
