import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { shallowEqualObjects } from 'shallow-equal';
import { Context } from '../../context/context';
import * as Api from '../../utils/Api';
import { industryAndCategoryOptions } from '../../utils/constants';
import { InputDocument } from '../../components/InputComponents/InputDocument/InputDocument';
import { Button } from '../../components/Button/Button';
import { InputTags } from '../../components/InputComponents/InputTags/InputTags';
import { InputText } from '../../components/InputComponents/InputText/InputText';
import { InputSelect } from '../../components/InputComponents/InputSelect/InputSelect';
import { InputSwitch } from '../../components/InputComponents/InputSwitch/InputSwitch';
import { useFormAndValidation } from '../../hooks/useFormValidationProfileCustomer';
import '../../components/FormComponents/CreateTaskForm/CreateTaskForm.css';
import '../ForgotPass/ForgotPass.css';
import '../Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly.css';
import '../Profiles/ProfileFreelancer/ProfileFreelancer.css';
import '../Profiles/Profile.css';
import './Order.css';

function Order() {
  const { values, errors, handleChange, handleChangeCustom, setValues, setErrors, resetForm } =
    useFormAndValidation();
  const [isEditable, setIsEditable] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { currentUser } = useContext(Context);
  const { id } = useParams();
  const [order, setOrder] = useState({});
  const [document, setDocument] = useState();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [isChecked, setIsChecked] = useState({
    budgetDiscussion: false,
    deadlineDiscussion: false,
  });
  // const [budget, setBudget] = useState('');
  // const [deadline, setDeadline] = useState('');
  const response = useRef();

  useEffect(() => {
    Api.getTaskById(id)
      .then((result) => {
        setOrder(result);
        // setValues({
        //   title: result?.title,
        //   activity: result?.category[0],
        //   stack: result?.stack,
        //   budget: result?.budget,
        //   // budgetDiscussion: result?.ask_budget,
        //   deadline: result?.deadline,
        //   // deadlineDiscussion: result?.ask_deadline,
        //   about: result?.description,
        //   // job_files: result.file,
        // });
        setIsChecked({
          budgetDiscussion: result?.ask_budget,
          deadlineDiscussion: result?.ask_deadline,
        });
        setTags(result?.stack?.map((item) => item?.name));
        // setDocument(result?.job_files);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // function handleBudget(event) {
  //   setBudget(event.target.value);
  // }

  // function handleDeadline(event) {
  //   setDeadline(event.target.value);
  // }

  function handleRespond() {
    if (order.is_responded) {
      response.current.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      Api.respondToTask(order?.id)
        .then(() => {
          setOrder((previous) => ({
            ...previous,
            is_responded: true,
          }));
        })
        .catch(console.error);
    }
  }

  function handleUpdateTask(event) {
    event.preventDefault();

    // console.log(values.activity);

    let allValues = {
      // ...values,
      title: values?.title,
      about: values?.about,
      // category: [values?.activity],
      // stacks: tags,
      budgetDiscussion: isChecked.budgetDiscussion,
      deadlineDiscussion: isChecked.deadlineDiscussion,
      // orderId: Math.floor(Math.random() * 100) + 1,
      // orderCreationDate: new Date().toString().split(':').slice(0, 2).join(':'),
      // file: document,
    };

    if (values?.activity?.length > 0) {
      allValues.category = [values?.activity];
    }

    if (values?.stacks?.length > 0) {
      const newTags = values?.stacks?.map((stack) => ({ name: stack }));
      if (!shallowEqualObjects(tags, newTags)) {
        allValues.stacks = tags;
      }
    }

    if (!isChecked.budgetDiscussion) {
      allValues.budget = values?.budget ? Number.parseInt(values.budget, 10) : order?.budget;
    }

    if (!isChecked.deadlineDiscussion) {
      allValues.deadline = values?.deadline ? values.deadline : order?.deadline;
    }

    if (document) {
      allValues.file = document;
    }

    const formValues = {
      title: allValues.title,
      category: allValues.category,
      stack:
        values?.stacks?.length > 0 ? allValues.stacks.map((stack) => ({ name: stack })) : undefined,
      budget: allValues.budget,
      ask_budget: allValues.budgetDiscussion,
      deadline: allValues.deadline,
      ask_deadline: allValues.deadlineDiscussion,
      description: allValues.about,
      job_files: allValues.file,
    };

    Api.updateTask(formValues, id)
      .then((response) => {
        // navigate('/', { replace: true });
        setOrder(response);
        setIsEditable(false);
        setValues(undefined);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleCancel() {
    // setValues(order);
    resetForm();
    setIsEditable(false);
    // setErrors({});
  }

  function handleDeleteTask() {
    setError('');

    Api.deleteTaskById(order?.id)
      .then(() => {
        setIsPopupOpen(false);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
        setError(error?.detail);
      });
  }

  // Получаю данные заказа
  // const tasks = JSON.parse(localStorage.getItem('taskValues'));
  // const task = tasks?.find((item) => String(item?.id) === id);
  // Записываю значения в переменные
  const stacksList = order?.stack?.map((item, index) => (
    <li key={index} className="order__list-item">
      {item?.name}
    </li>
  ));
  // -----------

  function addDocument(items) {
    setDocument(items);
  }

  return (
    (currentUser.is_worker || currentUser?.id === order?.client?.id) && (
      <>
        <Helmet>
          <title>{order?.title || 'Задача'} • Таски</title>
        </Helmet>

        <section className="profile order">
          <Link to=".." className="order__back-container">
            <div className="order__back" />
            Назад
          </Link>

          <div className="order_block">
            <div className="order__main-container left-column">
              <div className="profile_block profile_right-column">
                {isEditable ? (
                  <form className="order__form">
                    <h1 className="profile__title">Редактирование заказа</h1>
                    <div>
                      <p className="create-task-form__input-text">Название заказа</p>
                      <InputText
                        type="text"
                        placeholder="Кратко опишите суть задачи"
                        name="title"
                        width="100%"
                        onChange={handleChange}
                        // value={isEditable ? values?.title || '' : order?.title || ''}
                        // value={values?.title || order?.title || ''}
                        value={order?.title}
                        error={errors?.title}
                      />
                    </div>
                    <div>
                      <p className="create-task-form__input-text">Описание</p>
                      <InputText
                        type="textarea"
                        placeholder="Опишите задачу подробнее"
                        name="about"
                        width="100%"
                        height={150}
                        onChange={handleChange}
                        // value={isEditable ? values?.about || '' : order?.description || ''}
                        // value={values?.about || order?.description || ''}
                        value={order?.description}
                      />
                    </div>
                    <div>
                      <p className="create-task-form__input-text">Специализация</p>
                      <InputSelect
                        placeholder="Выберите из списка"
                        name="activity"
                        width="100%"
                        options={industryAndCategoryOptions}
                        // value={isEditable ? values?.activity || '' : order?.category || ''}
                        value={values?.activity || order?.category[0] || ''}
                        error={errors?.activity}
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
                        isDisabled={isChecked?.budgetDiscussion}
                        type="number"
                        placeholder="Бюджет"
                        name="budget"
                        width={295}
                        // onChange={handleBudget}
                        onChange={handleChange}
                        // value={isEditable ? values?.budget || '' : order?.budget || ''}
                        // value={values?.budget || order?.budget || ''}
                        value={order?.budget}
                      />
                    </div>
                    <InputSwitch
                      type="checkbox"
                      name="budgetDiscussion"
                      label="Жду предложений от фрилансеров"
                      marginTop={12}
                      // onChange={handleChange}
                      defaultChecked={isChecked?.budgetDiscussion}
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
                          // onChange={handleDeadline}
                          onChange={handleChange}
                          // value={isEditable ? values?.deadline || '' : order?.deadline || ''}
                          // value={values?.deadline || order?.deadline || ''}
                          value={order?.deadline}
                          isDisabled={isChecked?.deadlineDiscussion}
                        />
                      </div>
                    </div>
                    <InputSwitch
                      type="checkbox"
                      name="deadlineDiscussion"
                      label="Жду предложений от фрилансеров"
                      marginTop={12}
                      // onChange={handleChange}
                      defaultChecked={isChecked?.deadlineDiscussion}
                      onChange={() => {
                        setIsChecked((previous) => ({
                          ...previous,
                          deadlineDiscussion: !previous.deadlineDiscussion,
                        }));
                      }}
                    />
                    <div>
                      <p className="create-task-form__input-text">Загрузить файл</p>
                      <div className="create-task-form__input-doc-wrapper">
                        <InputDocument
                          name="portfolio"
                          value={values?.portfolio || order?.job_files || ''}
                          error={errors.portfolio}
                          setErrors={setErrors}
                          onChange={addDocument}
                        />
                      </div>
                    </div>

                    <div className="form-profile__bottom-buttons-container order__buttons-wrapper">
                      <button
                        type="button"
                        className="profile__main-text form-profile__bottom-buttons"
                        onClick={handleCancel}
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        onClick={handleUpdateTask}
                        className="profile__main-text form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                      >
                        Сохранить
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="form-profile__input-container">
                      <h1 className="profile__title">{order?.title}</h1>
                      <p className="profile__main-text">{order?.description}</p>
                      <ul className="order__list">{stacksList}</ul>
                    </div>

                    <div className="form-profile__input-container">
                      <h3 className="profile__title">Файлы</h3>
                      <div className="profile__file-container">
                        <InputDocument
                          name="portfolio"
                          value={order?.job_files || ''}
                          // error={errors.portfolio}
                          // onChange={addDocument}
                          isDisabled={true}
                          // onChange={(event) => handleDocPortfolioChange(event, key)} key={key}
                          // onDeleteDocClick={() => onDeleteDocPortfolioClick(key)}
                        />
                        {/*<div className="profile__file" />*/}
                        {/*<div className="profile__file" />*/}
                      </div>
                    </div>

                    {currentUser?.is_worker && (
                      <div className="form-profile__input-container">
                        <h3 className="profile__title">О заказчике</h3>
                        <div className="order__customer-container">
                          <img
                            src={order?.client?.photo}
                            alt="Фото заказчика"
                            className="order__client-logo"
                          />
                          <div>
                            <p className="profile__main-text">{order?.client?.name}</p>
                            <div className="order__customer-container">
                              <p className="profile__main-text order__client-text">
                                {order?.client?.web}
                              </p>
                              <p className="profile__main-text order__client-text">
                                {
                                  industryAndCategoryOptions.find(
                                    (option) => option?.value === order?.client?.industry?.name,
                                  )?.label
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="profile__main-text">{order?.client?.about}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {currentUser?.is_worker && order.is_responded && (
                <div
                  className="profile_block profile_right-column form-profile__input-container"
                  ref={response}
                >
                  <h3 className="profile__title">Ваш отклик</h3>
                  <p className="profile__main-text">{currentUser?.about}</p>
                </div>
              )}
            </div>

            <div className="profile_left-column">
              {currentUser?.is_worker ? (
                <Button
                  type="button"
                  text={order.is_responded ? 'Просмотреть отклик' : 'Откликнуться'}
                  width={289}
                  className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                  onClick={handleRespond}
                />
              ) : (
                <>
                  <Button
                    type="button"
                    text="Отклики"
                    width={289}
                    className="form-profile__bottom-buttons form-profile__bottom-buttons_type_submit"
                    onClick={() => navigate('responses')}
                  />
                  {!isEditable && (
                    <Button
                      type="button"
                      text="Редактировать заказ"
                      width={289}
                      buttonSecondary={true}
                      className={`form-profile__bottom-buttons${
                        isEditable ? ' form-profile__bottom-buttons-hide' : ''
                      }`}
                      onClick={() => setIsEditable(true)}
                    />
                  )}
                  <Button
                    type="button"
                    text="Удалить заказ"
                    width={289}
                    buttonSecondary={true}
                    onClick={() => setIsPopupOpen(true)}
                    className="form-profile__bottom-buttons"
                  />
                </>
              )}

              {!isEditable && (
                <div className="profile_block profile__left-column-info">
                  <div>
                    <h2 className="profile__title">Дата публикации</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {new Date(order?.pub_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Специализация</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {
                        industryAndCategoryOptions.find(
                          (option) => order?.category && option?.value === order?.category[0],
                        )?.label
                      }
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Навыки</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {/*{stacksList2}*/}
                      {order?.stack?.map((item) => item?.name).join(', ')}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Бюджет</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {order?.ask_budget ? 'Ожидает предложений' : `${order?.budget} ₽`}
                    </p>
                  </div>
                  <div>
                    <h2 className="profile__title">Срок</h2>
                    <p className="profile__main-text profile__info-main-text">
                      {order?.ask_deadline
                        ? 'По договоренности'
                        : new Date(order?.deadline).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {isPopupOpen && (
          <dialog className="popup-overlay">
            <div className="popup">
              <h2 className="popup-title">Вы действительно хотите удалить заказ?</h2>
              <p className="popup-description">Отменить это действие будет невозможно</p>
              <Button
                type="sumbit"
                text="Удалить"
                width={289}
                marginBottom={12}
                onClick={handleDeleteTask}
              />
              <Button
                type="button"
                text="Отменить"
                buttonSecondary={true}
                width={289}
                // marginBottom={12}
                onClick={() => {
                  setError('');
                  setIsPopupOpen(false);
                }}
              />
              <span className="popup__error">{error}</span>
            </div>
          </dialog>
        )}
      </>
    )
  );
}

export { Order };
