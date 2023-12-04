import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Context } from '../../context/context';
import { Layout } from '../../layout/Layout';
import { ProtectedRoute } from '../../services/PotectedRouter';
import * as Api from '../../utils/Api';
import { Main } from '../../pages/Main/Main';
import { SignOut } from '../SignOut/SignOut';
import { FreelancerCompleteForm } from '../FormComponents/FreelancerCompleteForm/FreelancerCompleteForm';
import { CustomerCompleteForm } from '../FormComponents/CustomerCompleteForm/CustomerCompleteForm';
import { CreateTaskForm } from '../FormComponents/CreateTaskForm/CreateTaskForm';
import { NotFound } from '../../pages/NotFound/NotFound';
import { Register } from '../../pages/Register/Register';
import { Login } from '../../pages/Login/Login';
import { ForgotPass } from '../../pages/ForgotPass/ForgotPass';
import { ProfileFreelancer } from '../../pages/Profiles/ProfileFreelancer/ProfileFreelancer';
import { ResetPass } from '../../pages/ResetPass/ResetPass';
import { ProfileCustomer } from '../../pages/Profiles/ProfileCustomer/ProfileCustomer';
import { ProfileFreelancerViewOnly } from '../../pages/Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly';
import { Order } from '../../pages/Order/Order';
import './App.css';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  // состояние отображения фильтра поиска
  const [orderFilter, setOrderFilter] = useState(true);
  // обект со значениями фильтров фильтров
  const [freelanceFilter, setFreelanceFilter] = useState({});
  // временное решение для ререндеринга
  // const [rerender, setRerender] = useState(true);
  const [errorRequest, setErrorRequest] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const accessToken = sessionStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');

    function refreshTokenHandler() {
      if (refreshToken) {
        Api.getNewAccessToken()
          .then((response) => {
            if (response.ok) {
              return response.json();
            }

            return response.json().then((error) => Promise.reject(error.detail));
          })
          .then((tokens) => {
            if (tokens.access) {
              sessionStorage.setItem('access', tokens.access);

              Api.getUserInfo()
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  }

                  return response.json().then((error) => Promise.reject(error.detail));
                })
                .then((userData) => {
                  setCurrentUser(userData);
                  setIsAuthenticated(true);
                  setIsLoading(false);
                })
                .catch((error) => {
                  setIsAuthenticated(false);
                  sessionStorage.removeItem('access');
                  console.error(error);
                  setIsLoading(false);
                });
            }
          })
          .catch((error) => {
            setIsAuthenticated(false);
            sessionStorage.removeItem('access');
            console.error(error);
            setIsLoading(false);
          });
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    if (accessToken && refreshToken) {
      Api.getUserInfo()
        .then((response) => {
          if (response.ok) {
            return response.json();
          }

          return response.json().then((error) => Promise.reject(error.detail));
        })
        .then((userData) => {
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch((error) => {
          refreshTokenHandler();
          console.error(error);
        });
    } else {
      refreshTokenHandler();
    }
  }, []);

  function handleRegisterSubmit(values) {
    Api.register(values)
      .then((data) => {
        setIsError(false);
        setErrorRequest({});

        navigate('/profile/complete', { replace: true });

        Api.authenticateUser(values)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            if (response.status === 401) {
              return response.json().then((error) => Promise.reject(error.detail));
            }

            return response.json().then((error) => Promise.reject(error.detail));
          })
          .then((response) => {
            if (response.refresh && response.access) {
              localStorage.setItem('refresh', response.refresh);
              sessionStorage.setItem('access', response.access);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        setErrorRequest(error);
        setIsError(true);
      });
  }

  function handleCustomerSubmit(data) {
    const formValues = {
      photo: data.photo?.photo,
      name: data.values?.name,
      industry: {
        name: data.values?.industry,
      },
      about: data.values?.about,
      web: data.values?.web,
    };

    Api.createUserProfile(formValues)
      .then((result) => {
        setCurrentUser(result);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleFreelancerSubmit(data) {
    const formValues = {
      contacts: [
        {
          type: 'phone',
          value: data.values.phone,
          preferred: data.values.preferred === 'phone',
        },
        {
          type: 'email',
          value: data.values.email,
          preferred: data.values.preferred === 'email',
        },
        {
          type: 'telegram',
          value: data.values.telegram,
          preferred: data.values.preferred === 'telegram',
        },
      ],
      stacks: data.tags.map((tag) => ({ name: tag })),
      categories: [
        {
          name: data.values.activity,
        },
      ],
      education: [
        {
          diploma: data.document,
          name: data.values.education,
          faculty: data.values.faculty,
          start_year: data.values.start_year,
          finish_year: data.values.finish_year,
          degree: data.values.degree,
        },
      ],
      portfolio: data.portfolioFile,
      photo: data.profilePhoto.photo,
      payrate: data.values.payrate,
      about: data.values.about,
      web: data.values.web,
    };

    Api.createUserProfile(formValues)
      .then((result) => {
        setCurrentUser(result);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleTaskSubmit(data) {
    const formValues = {
      title: data.task_name,
      category: [data.activity],
      stack: data.stacks.map((stack) => ({ name: stack })),
      budget: data.budget?.budget,
      ask_budget: data.budgetDiscussion,
      deadline: data.deadline?.deadline,
      ask_deadline: data.deadlineDiscussion,
      description: data.about,
      job_files: data.file,
    };

    Api.createTask(formValues)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const logIn = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return;
  }

  return (
    <Context.Provider
      value={{
        currentUser,
        isAuthenticated,
        orderFilter,
        logIn,
        freelanceFilter,
        setFreelanceFilter,
        // rerender,
        // setRerender,
      }}
    >
      <HelmetProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Main />} />
            <Route
              path="signup"
              element={
                <Register
                  handleRegister={handleRegisterSubmit}
                  error={errorRequest}
                  isError={isError}
                />
              }
            />
            <Route
              path="signin"
              element={
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  setCurrentUser={setCurrentUser}
                  currentUser={currentUser}
                />
              }
            />
            <Route path="forgot-password" element={<ForgotPass />} />
            <Route path="reset-password" element={<ResetPass />} />
            <Route
              path="signout"
              element={
                <SignOut setCurrentUser={setCurrentUser} setIsAuthenticated={setIsAuthenticated} />
              }
            />
            <Route path="*" element={<NotFound />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="profile"
                element={
                  currentUser?.is_customer ? (
                    <ProfileCustomer setCurrentUser={setCurrentUser} />
                  ) : (
                    <ProfileFreelancer setCurrentUser={setCurrentUser} />
                  )
                }
              />
              <Route
                path="profile/complete"
                element={
                  currentUser?.is_customer ? (
                    <CustomerCompleteForm handleCustomerSubmit={handleCustomerSubmit} />
                  ) : (
                    <FreelancerCompleteForm onSubmit={handleFreelancerSubmit} />
                  )
                }
              />
              <Route path="create-task" element={<CreateTaskForm onSubmit={handleTaskSubmit} />} />
              <Route path="order/:id" element={<Order />} />
              <Route path="freelancer/:id" element={<ProfileFreelancerViewOnly />} />
            </Route>
          </Route>
        </Routes>
      </HelmetProvider>
    </Context.Provider>
  );
}

export { App };
