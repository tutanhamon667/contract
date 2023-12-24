import { useState, useEffect } from 'react';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { industryAndCategoryOptions } from '../../../utils/constants';
import { InputText } from '../../InputComponents/InputText/InputText';
import { InputSelect } from '../../InputComponents/InputSelect/InputSelect';
import { InputTags } from '../../InputComponents/InputTags/InputTags';
import { InputDocument } from '../../InputComponents/InputDocument/InputDocument';
import { InputSwitch } from '../../InputComponents/InputSwitch/InputSwitch';
import { Button } from '../../Button/Button';
import './CreateTaskForm.css';

function CreateTaskForm({ onSubmit }) {
  const {
    values,
    errors,
    isValid,
    handleChange,
    checkErrors,
    setIsValid,
    deleteSpaces,
    setErrors,
    handleBlur,
    handleChangeCheckbox,
    handleChangeCustom,
  } = useFormAndValidation();

  // console.log(values);

  const valuesArray = [
    !values.title,
    !values.activity,
    !values.tags,
    values.deadlineDiscussion ? !values.deadlineDiscussion : !values.deadline,
    values.budgetDiscussion ? !values.budgetDiscussion : !values.budget,
    !values.about,
    !isValid,
  ];
  const isDisabled = valuesArray.some(Boolean);

  const [document, setDocument] = useState();
  const [tags, setTags] = useState([]);

  function addDocument(items) {
    setDocument(items);
  }

  useEffect(() => {
    setIsValid(checkErrors(errors));
  }, [isValid, errors, values, setIsValid, checkErrors]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const allValues = {
      ...values,
      stacks: tags,
      deadlineDiscussion: values?.deadlineDiscussion || false,
      budgetDiscussion: values?.budgetDiscussion || false,
    };

    if (!values?.deadlineDiscussion) {
      allValues.deadline = values.deadline;
    }

    if (!values?.budgetDiscussion) {
      allValues.budget = Number.parseInt(values.budget, 10);
    }

    if (document) {
      allValues.file = document;
    }

    onSubmit(allValues);
  };

  return (
    <form className="create-task-form" onSubmit={handleSubmit}>
      <div>
        <p className="create-task-form__input-text">Название заказа</p>
        <InputText
          type="text"
          placeholder="Кратко опишите суть задачи"
          name="title"
          width={610}
          onChange={handleChange}
          value={values.title || ''}
          error={errors.title}
          onBlur={deleteSpaces}
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
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Навыки</p>
        <InputTags
          name="stacks"
          tags={tags}
          setTags={setTags}
          handleChange={handleChangeCustom}
          error={errors.tags}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Бюджет</p>
        <InputText
          isDisabled={values.budgetDiscussion || false}
          type="number"
          placeholder="Бюджет"
          name="budget"
          width={295}
          onChange={handleChange}
          value={values.budget || ''}
          error={errors.budget}
        />
      </div>
      <InputSwitch
        type="checkbox"
        name="budgetDiscussion"
        label="Жду предложений от фрилансеров"
        marginTop={12}
        value={values.budgetDiscussion || false}
        checked={values.budgetDiscussion || false}
        onChange={handleChangeCheckbox}
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
            onBlur={handleBlur}
            value={values.deadline || ''}
            error={errors.deadline}
            isDisabled={values.deadlineDiscussion || false}
          />
        </div>
      </div>
      <InputSwitch
        type="checkbox"
        name="deadlineDiscussion"
        label="Жду предложений от фрилансеров"
        marginTop={12}
        checked={values.budgetDiscussion || false}
        onChange={handleChangeCheckbox}
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
          error={errors.about}
        />
      </div>
      <div>
        <p className="create-task-form__input-text">Загрузить файл</p>
        <div className="create-task-form__input-doc-wrapper">
          <InputDocument
            name="portfolio"
            onChange={addDocument}
            setErrors={setErrors}
            error={errors.portfolio}
            // errors={errors}
          />
        </div>
      </div>

      <Button
        text="Опубликовать заказ"
        width={289}
        marginTop={60}
        marginBottom={200}
        disabled={isDisabled}
      />
    </form>
  );
}

export { CreateTaskForm };
