import { useEffect, useState } from 'react';
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
import { ResponseList } from '../../pages/ResponseList/ResponseList';
import './App.css';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [tasks, setTasks] = useState([]);
  const [statePopup, setStatePopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // состояние отображения фильтра поиска
  const [orderFilter, setOrderFilter] = useState(true);
  // объект со значениями фильтров
  const [freelanceFilter, setFreelanceFilter] = useState({});
  // временное решение для ререндеринга
  // const [rerender, setRerender] = useState(true);
  const [errorRequest, setErrorRequest] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [popupError, setPopupError] = useState();
  const navigate = useNavigate();

  useEffect(() => {
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
        setCurrentUser({ user: data, is_customer: data.is_customer, is_worker: data.is_worker });
        //   setCurrentUser({ is_customer: data.is_customer, is_worker: data.is_worker });

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

    Api.updateUserProfile(formValues)
      .then((result) => {
        setCurrentUser(result);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleFreelancerSubmit(data) {
    // console.log(data);
    Api.updateUserProfile(data)
      .then((result) => {
        setCurrentUser(result);
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleForgotPassSubmit(data) {
    // console.log(data);
    Api.requestNewPassword(data);
  }

  function handleTaskSubmit(data) {
    const formValues = {
      title: data.title,
      category: [data.activity],
      stack: data.stacks.map((stack) => ({ name: stack })),
      budget: data?.budget,
      ask_budget: data.budgetDiscussion,
      deadline: data?.deadline,
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

  function getMyTasks() {
    if (currentUser?.is_customer) {
      Api.getTasksWithAuthorization()
        .then((response) => {
          setTasks(response.results.filter((task) => task.client.id === currentUser.id));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  function createChat(data) {
    Api.createChat(data)
      .then(() => {
        setStatePopup(true);
        setIsPopupOpen(false);
        setPopupError('');
      })
      .catch((error) => {
        console.error(error.non_field_errors.toString());
        setPopupError(error.non_field_errors.toString());
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
            <Route
              path="forgot-password"
              element={<ForgotPass onSubmit={handleForgotPassSubmit} />}
            />
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
              <Route path="order/:id/responses" element={<ResponseList />} />
              <Route
                path="freelancer/:id"
                element={
                  <ProfileFreelancerViewOnly
                    getTasks={getMyTasks}
                    tasks={tasks}
                    onSubmit={createChat}
                    statePopup={statePopup}
                    setStatePopup={setStatePopup}
                    isPopupOpen={isPopupOpen}
                    setIsPopupOpen={setIsPopupOpen}
                    popupError={popupError}
                    setPopupError={setPopupError}
                  />
                }
              />
            </Route>
          </Route>
        </Routes>
      </HelmetProvider>
    </Context.Provider>
  );
}

export { App };
