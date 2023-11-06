import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Context } from "../../context/context";
import { ProtectedRoute } from "../../services/PotectedRouter";
import * as Api from '../../utils/Api';
import Layout from "../../layout/Layout";
import Main from "../Main/Main";
import { SignOut } from "../SignOut/SignOut";
import { FreelancerCompleteForm } from "../Forms/FreelancerCompleteForm/FreelancerCompleteForm";
import { CustomerCompleteForm } from '../Forms/CustomerCompleteForm/CustomerCompleteForm';
import { CreateTaskForm } from '../Forms/CreateTaskForm/CreateTaskForm';
import NotFound from "../../pages/NotFound/NotFound";
import Register from "../../pages/Register/Register";
import Login from "../../pages/Login/Login";
import ForgotPass from "../../pages/ForgotPass/ForgotPass";
import ProfileFreelancer from "../../pages/Profiles/ProfileFreelancer/ProfileFreelancer";
import ResetPass from "../../pages/ResetPass/ResetPass";
import ProfileCustomer from "../../pages/Profiles/ProfileCustomer/ProfileCustomer";
import ProfileFreelancerViewOnly from "../../pages/Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly";
import Order from "../../pages/Order/Order";
import "./App.css";

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  // состояние отображения фильтра поиска
  const [orderFilter, setOrderFilter] = useState(true);
  // обект со значениями фильтров фильтров
  const [freelanceFilter, setFreelanceFilter] = useState({});
  // временное решение для ререндеринга
  const [rerender, setRerender] = useState(true);
  const [errorRequest, setErrorRequest] = useState({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const accessToken = sessionStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');

    if (accessToken && refreshToken) {
      Api.getUserInfo()
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else if (!res.ok) {
            return res.json().then(error => {
              return Promise.reject(error.detail);
            })
          }
        })
        .then((res) => {
          setCurrentUser(res);
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

    function refreshTokenHandler() {
      if (refreshToken) {
        Api.getNewAccessToken()
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              return res.json().then(error => {
                return Promise.reject(error.detail);
              })
            }
          })
          .then(res => {
            if (res['access']) {
              sessionStorage.setItem('access', res['access']);

              Api.getUserInfo()
                .then((res) => {
                  if (res.ok) {
                    return res.json();
                  }
                  return res.json().then(error => {
                    return Promise.reject(error.detail);
                  });
                })
                .then((res) => {
                  setCurrentUser(res);
                  setIsAuthenticated(true);
                  setIsLoading(false);
                })
                .catch((error) => {
                  setIsAuthenticated(false);
                  sessionStorage.removeItem('access');
                  console.error(error);
                  setIsLoading(false);
                })
            }
          })
          .catch((error) => {
            setIsAuthenticated(false);
            sessionStorage.removeItem('access');
            console.error(error);
            setIsLoading(false);
          })
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
  }, [])

  function handleRegisterSubmit(values) {
    Api.register(values)
      .then((data) => {
        // console.log(data);
        setIsError(false);
        setErrorRequest({});

        const role = data.is_customer ? "customer" : data.is_worker && "freelancer";
        navigate(`/${role}/complete`, { replace: true });

        // console.log(values)

        Api.authenticateUser(values)
        .then(res => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 401) {
            return res.json().then(error => {
              return Promise.reject(error.detail);
            });
          } else {
            return res.json().then(error => {
              return Promise.reject(error.detail);
          });
          }
        })
        .then(response => {
          if (response['refresh'] && response['access']) {
            localStorage.setItem('refresh', response['refresh']);
            sessionStorage.setItem('access', response['access']);
          }
        })
        .catch((err)=>{
          console.error(err)
        })
      })
      .catch((err) => {
        setErrorRequest(err);
        setIsError(true);
      })
  }

  function handleCustomerSubmit(data) {
    // console.log(data);
    const formValues = {
      photo: data.photo?.photo,
      name: data.values?.name,
      industry: {
        name: data.values?.industry
      },
      about: data.values?.about,
      web: data.values?.web
    }
   // console.log(array)
    Api.createUserProfile(formValues)
      .then((res) => {
       // console.log(data)
       setCurrentUser(res);
       navigate('/customer', { replace: true });
      })
      .catch((err)=>{
        console.error(err);
      })
  }

  function handleFreelancerSubmit(data) {
    const formValues = {
      contacts: [
        {
          type: 'phone',
          value: data.values.phone,
          preferred: data.values.preferred === 'phone'
        },
        {
          type: 'email',
          value: data.values.email,
          preferred: data.values.preferred === 'email'
        },
        {
          type: 'telegram',
          value: data.values.telegram,
          preferred: data.values.preferred === 'telegram'
        }
      ],
      stacks: data.tags.map((tag) => ({ name: tag })),
      categories: [
        {
          name: data.values.activity
        }
      ],
      education: [
        {
          diploma: [
            {
              file: data.document.diploma,
              name: data.document.diploma_name
            }
          ],
          name: data.values.education,
          faculty: data.values.faculty,
          start_year: data.values.start_year,
          finish_year: data.values.finish_year,
          degree: data.values.degree
        }
      ],
      portfolio: [
        {
          file: data.portfolioFile.file,
          name: data.portfolioFile.file_name
        }
      ],
      photo: data.profilePhoto.photo,
      payrate: data.values.payrate,
      about: data.values.about,
      web: data.values.web
    }

    Api.createUserProfile(formValues)
      .then((res) => {
        setCurrentUser(res);
        navigate('/', { replace: true });
      })
      .catch((err)=>{
        console.error(err);
      })
  }

  const handleOrderFilter = (state) => {
    setOrderFilter(state);
  }

  const logIn = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return;
  }

  return (
    <Context.Provider value={{
      currentUser,
      isAuthenticated,
      orderFilter,
      logIn,
      handleOrderFilter,
      freelanceFilter,
      setFreelanceFilter,
      rerender,
      setRerender
    }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="freelancer" element={<ProfileFreelancer setCurrentUser={setCurrentUser} />} />
            <Route path="profile-freelancer" element={<ProfileFreelancerViewOnly />} />
            <Route path="freelancer/complete" element={<FreelancerCompleteForm onSubmit={handleFreelancerSubmit}/>} />
            <Route path="customer" element={<ProfileCustomer setCurrentUser={setCurrentUser} />} />
            <Route path="customer/complete" element={<CustomerCompleteForm handleCustomerSubmit={handleCustomerSubmit} />} />
            <Route path="create-task" element={<CreateTaskForm />} />
          </Route>
          <Route index element={<Main />} />
          <Route path="order/:id" element={<Order />} />
          <Route path="signup" element={
            <Register handleRegister={handleRegisterSubmit} error={errorRequest} isError={isError} />
          } />
          <Route path="signin" element={
            <Login setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} currentUser={currentUser} />
          } />
          <Route path="forgot-password" element={<ForgotPass />} />
          <Route path="reset-password" element={<ResetPass />} />
          <Route path="signout" element={
            <SignOut setCurrentUser={setCurrentUser} setIsAuthenticated={setIsAuthenticated} />
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}

export default App;
