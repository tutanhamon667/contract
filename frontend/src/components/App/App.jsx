import React, { useState } from "react";
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import { Context } from "../../context/context";
import Layout from "../../layout/Layout";
import { ProtectedRoute } from "../../services/PotectedRouter";
import { userFreelancer, userCustomer } from "../../utils/constants";
import Main from "../Main/Main";
import NotFound from "../../pages/NotFound/NotFound";
import Register from "../../pages/Register/Register";
import Login from "../../pages/Login/Login";
import ForgotPass from "../../pages/ForgotPass/ForgotPass";
import { SignOut } from "../SignOut/SignOut";
import ProfileFreelancer from "../../pages/Profiles/ProfileFreelancer/ProfileFreelancer";
import { FreelancerCompleteForm } from "../Forms/FreelancerCompleteForm/FreelancerCompleteForm";
import { CustomerCompleteForm } from '../Forms/CustomerCompleteForm/CustomerCompleteForm';
import ResetPass from "../../pages/ResetPass/ResetPass";
import ProfileCustomer from "../../pages/Profiles/ProfileCustomer/ProfileCustomer";
import ProfileFreelancerViewOnly from "../../pages/Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly";
import { CreateTaskForm } from '../Forms/CreateTaskForm/CreateTaskForm';
import Order from "../../pages/Order/Order";
import "./App.css";
import * as api from '../../utils/Api';

function App() {
  const [authenticated, setAuthenticated] = useState(true);
  // const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(userFreelancer);
  // const [currentUser, setCurrentUser] = useState(userCustomer);
  // состояние отображения фильтра поиска
  const [orderFilter, setOrderFilter] = useState(true);

  const navigate = useNavigate();

  function handleRegisterSubmit({ first_name, last_name, email, password, re_password, is_customer, is_worker }){
    api.register({ first_name, last_name, email, password, re_password, is_customer, is_worker })
    .then((data) => {
      console.log(data);
      navigate(`/${globalThis.role}/complete`, {replace: true})
    })
    .catch((err) => {
      console.log(err);
    })
  }

  function updateUser(userEmail) {
    setCurrentUser({
      ...currentUser,
      email: userEmail.email
    })
  }

  const handleOrderFilter = (state) => {
    setOrderFilter(state)
  }

  const logIn = () => {
    setAuthenticated(true);
  };

  const logOut = () => {
    setAuthenticated(false);
  };

  return (
      <Context.Provider value={{ currentUser, authenticated, orderFilter, updateUser, logIn, logOut, handleOrderFilter }}>
        <Routes>
          <Route path="/" element={<Layout setAuthenticated={setAuthenticated} setCurrentUser={setCurrentUser} />}>
            <Route element={<ProtectedRoute />}>
              <Route path="freelancer" element={<ProfileFreelancer />} />
              <Route path="profile-freelancer" element={<ProfileFreelancerViewOnly />} />
              <Route path="freelancer/complete" element={<FreelancerCompleteForm />} />
              <Route path="customer" element={<ProfileCustomer />} />
              <Route path="customer/complete" element={<CustomerCompleteForm />} />
              <Route path="create-task" element={<CreateTaskForm />} />
            </Route>
            <Route index element={<Main />} />
            <Route path="signup" element={<Register handleRegister={handleRegisterSubmit} />} />
            <Route path="order" element={<Order />} />
            <Route path="signin" element={
              <Login setAuthenticated={setAuthenticated} setCurrentUser={setCurrentUser} />
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
