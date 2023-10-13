import InputText from '../../Inputs/InputText/InputText';
import InputMultipleSelect from '../../Inputs/InputMultipleSelect/InputMultipleSelect';
import InputTags from '../../Inputs/InputTags/InputTags';
import { InputDoc } from '../../Inputs/InputDoc/InputDoc';
import Button from '../../Button/Button';
import React, { useState } from 'react';
import './CreateTaskForm.css';
import { activityOptions } from '../../../utils/constants';

const MAX_ATTACHED_DOCS = 8;

function CreateTaskForm() {
  const [docKeys, setDocKeys] = useState([Date.now()]);

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
  };

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <label>
        <p className="create-task-form__input-text">Название заказа</p>
        <InputText type="text" placeholder="Кратко опишите суть задачи" name="task_name" width={610} />
      </label>
      <label>
        <p className="create-task-form__input-text">Специализация</p>
        <InputMultipleSelect name="activity" options={activityOptions} />
      </label>
      <label>
        <p className="create-task-form__input-text">Навыки</p>
        <InputTags name="stacks" />
      </label>
      <label>
        <p className="create-task-form__input-text">Бюджет</p>
        <InputText type="number" placeholder="Бюджет" name="budget" width={295} />
      </label>
      <label className="create-task-form__input-checkbox-text">
        <input type="checkbox" className="create-task-form__input-checkbox" name="budget-discussion"/>
        Жду предложений от фрилансеров
      </label>
      <div>
        <p className="create-task-form__input-text">Сроки</p>
        <div className="create-task-form__input-year-wrapper">
          <InputText type="date" placeholder="Окончание" name="deadline" width={295} />
        </div>
      </div>
      <label className="create-task-form__input-checkbox-text">
        <input type="checkbox" className="create-task-form__input-checkbox" name="deadline-discussion"/>
        Жду предложений от фрилансеров
      </label>
      <label>
        <p className="create-task-form__input-text">Описание</p>
        <InputText type="textarea" placeholder="Опишите задачу подробнее" name="about" width={610} height={150} />
      </label>
      <div>
        <p className="create-task-form__input-text">Загрузить файл</p>
        <div className="create-task-form__input-doc-wrapper">
          {docKeys.slice(0, MAX_ATTACHED_DOCS).map((key) => (
            <InputDoc key={key} name="portfolio" onChange={(event) => handleDocChange(event, key)}
                      onDeleteDocClick={() => onDeleteDocClick(key)}
            />
          ))}
        </div>
      </div>

      <Button text="Опубликовать заказ" width={289} marginTop={60} marginBottom={200}></Button>
    </form>
  );
}

export { CreateTaskForm };
