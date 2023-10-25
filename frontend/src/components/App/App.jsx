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
  const [errorRequest, setErrorRequest] = useState({});
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const accessToken = sessionStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');

    if (accessToken) {
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
        })
        .catch((error) => {
          setIsAuthenticated(false);
          console.error(error);
        });
    } else if (refreshToken) {
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
        .then(response => {
          if (response['refresh'] && response['access']) {
            localStorage.setItem('refresh', response['refresh']);
            sessionStorage.setItem('access', response['access']);
          }
        })
        .then(() => {
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
            })
            .catch((error) => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('access');
              console.error(error);
            })
        })
        .catch((error) => {
          setIsAuthenticated(false);
          sessionStorage.removeItem('access');
          console.error(error);
        })
    } else {
      setIsAuthenticated(false);
    }
  }, [])

  function handleRegisterSubmit({ first_name, last_name, email, password, re_password, is_customer, is_worker }){
    Api.register({ first_name, last_name, email, password, re_password, is_customer, is_worker })
    .then((data) => {
      console.log(data);
      setIsError(false);
      setErrorRequest({});
      navigate(`/${globalThis.role}/complete`, {replace: true});
    })
    .catch((err) => {
      setErrorRequest(err);
      setIsError(true);
    })
  }

  // function updateUser(userEmail) {
  //   setCurrentUser({
  //     ...currentUser,
  //     email: userEmail.email
  //   })
  // }

  const handleOrderFilter = (state) => {
    setOrderFilter(state);
  }

  // const logIn = () => {
  //   setIsAuthenticated(true);
  // };

  const logOut = () => {
    setIsAuthenticated(false);
  };

  const handleFreelanceFilter = (filter) => {
    setFreelanceFilter(filter);
    console.log(freelanceFilter);
  }

  return (
    <Context.Provider value={{
      currentUser,
      isAuthenticated,
      orderFilter,
      // logIn,
      logOut,
      handleOrderFilter,
      freelanceFilter,
      handleFreelanceFilter
    }}>
      <Routes>
        <Route path="/" element={<Layout setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />}>
          <Route element={<ProtectedRoute />}>
            <Route path="freelancer" element={<ProfileFreelancer />} />
            <Route path="profile-freelancer" element={<ProfileFreelancerViewOnly />} />
            <Route path="freelancer/complete" element={<FreelancerCompleteForm />} />
            <Route path="customer" element={<ProfileCustomer />} />
            <Route path="customer/complete" element={<CustomerCompleteForm />} />
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
          <Route path="signout" element={<SignOut />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Context.Provider>
  );
}

export default App;
