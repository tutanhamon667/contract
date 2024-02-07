import React, { useState, useEffect } from 'react';
import { ResumeAPI } from '../../../utils/resumeApi';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFormAndValidation } from '../../../hooks/useFormValidationProfileCustomer';
import { Context } from '../../../context/context';
import { industryAndCategoryOptions, degreeOptions } from '../../../utils/constants';
import { InputTags } from '../../../components/InputComponents/InputTags/InputTags';
import { InputDocument } from '../../../components/InputComponents/InputDocument/InputDocument';
import { InputSelect } from '../../../components/InputComponents/InputSelect/InputSelect';
import { InputText } from '../../../components/InputComponents/InputText/InputText';
import { InputImage } from '../../../components/InputComponents/InputImage/InputImage';
import { Button } from '../../../components/Button/Button';
import { InputSwitch } from '../../../components/InputComponents/InputSwitch/InputSwitch';
import '../../../components/FormComponents/FreelancerCompleteForm/FreelancerCompleteForm.css';
import './ProfileFreelancer.css';
import '../Profile.css';

const ResumePage = (props) => {
    const currentUser = props.currentUser;
    const [error, setError] = useState({
        code: null,
        message: null,
    });
    const [isEditable, setIsEditable] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [editingResume, setEditingResume] = useState(null);
    const [newResume, setNewResume] = useState({
        id: null,
        worker: '',
        stack: '',
        salary: 0,
        deposit: 0,
        work_experience: 0,
        is_offline: false,
        is_fulltime: false,
        region: '',
    });
    const resumeApi = new ResumeAPI(setResumes, setError);
    useEffect(() => {
        // Загрузка резюме при монтировании страницы
        resumeApi.getUserResumes();

    }, []);

    const handleEditClick = (resume) => {
        setEditingResume(resume);
        // Копирование данных выбранного резюме в форму редактирования
        setNewResume({ ...resume });
    };

    const handleSaveClick = async () => {
        try {
            if (editingResume) {
                // Редактирование существующего резюме
                await resumeApi.updateResume(newResume)
            } else {
                // Создание нового резюме
                await resumeApi.createResume(newResume)
            }

            // Обновление списка резюме
            await resumeApi.getUserResumes();

            // Очистка формы редактирования
            setEditingResume(null);
            setNewResume({
                id: null,
                worker: '',
                stack: '',
                salary: 0,
                deposit: 0,
                work_experience: 0,
                is_offline: false,
                is_fulltime: false,
                region: '',
            });
        } catch (error) {
            console.error('Error saving resume:', error);
        }
    };

    const handleDeleteClick = async (id) => {
        try {
            await resumeApi.deleteResume({ id });
            await resumeApi.getUserResumes();
        } catch (error) {
            console.error('Error deleting resume:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setNewResume((prevResume) => ({
            ...prevResume,
            [name]: fieldValue,
        }));
    };

    return (
        <div className="profile">
            <Helmet>
                <title>
                    {`${currentUser?.user?.first_name} ${currentUser?.user?.last_name}` || 'Мой профиль'} •
                    Таски
                </title>
            </Helmet>

            <div className="profile_left-column">
                <div className="profile_block profile__user-info">
                    <InputImage
                        name="photo"
                        width={80}
                        height={80}
                        value={values.photo || currentUser.photo || ''}
                        error={errors.photo}
                        onChange={handleAvatar}
                        isDisabled={!isEditable}
                    />
                    <h2 className="profile__title profile__title_place_aside">
                        {currentUser.user?.first_name} {currentUser.user?.last_name}
                    </h2>
                    <p className="profile__main-text">Фрилансер</p>
                </div>

                <div className="profile__separate-line" />

                <div className="profile_block profile__setting ">
                    <h3 className="profile__title">Настройки</h3>
                    <div className="profile__separate-line" />
                    <Link className="profile__main-text" to="#">
                        Информация
                    </Link>
                    <Link className="profile__main-text" to="/profile/resume">
                        Мои резюме
                    </Link>
                </div>
            </div>
            <div className="profile_block profile__form-container">
                <form className="form-profile" onSubmit={handleSubmit}>
                    <div className="form-profile__top-container">
                        <h2 className="profile__title">Информация об аккаунте</h2>
                        {isEditable ? (
                            <>
                                <button
                                    onClick={() => setIsEditable(false)}
                                    className="form-top-buttons form-top-buttons_type_cancel"
                                    type="button"
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="form-top-buttons form-top-buttons_type_submit">
                                    Сохранить
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditable(true)}
                                className="form-top-buttons form-top-buttons_type_submit"
                            >
                                Редактировать
                            </button>
                        )}
                    </div>
                    <div>
                        <h1>Список Резюме</h1>

                        {/* Форма создания/редактирования резюме */}
                        <form>
                            <label>
                                Пользователь:
                                <input
                                    type="text"
                                    name="worker"
                                    value={newResume.worker}
                                    onChange={handleChange}
                                />
                            </label>

                            {/* Добавьте аналогичные блоки для других полей резюме */}

                            <button type="button" onClick={handleSaveClick}>
                                {editingResume ? 'Сохранить изменения' : 'Создать Резюме'}
                            </button>
                        </form>


                    </div>
                </form>
                {/* Список резюме */}
                <ul>
                    {resumes.map((resume) => (
                        <li key={resume.id}>
                            {/* Отображение данных резюме */}
                            <div>
                                <button type="button" onClick={() => handleEditClick(resume)}>
                                    Редактировать
                                </button>
                                <button type="button" onClick={() => handleDeleteClick(resume.id)}>
                                    Удалить
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


        </div>

    );
};

export { ResumePage };
