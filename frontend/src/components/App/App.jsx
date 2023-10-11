import React, { useEffect, useState } from "react";
import Main from "../Main/Main";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Context } from "../../context/context";
import Layout from "../../layout/Layout";
import NotFound from "../../pages/NotFound/NotFound";
import Register from "../../pages/Register/Register";
import Login from "../../pages/Login/Login";
import ForgotPass from "../../pages/ForgotPass/ForgotPass";
import { SignOut } from "../SignOut/SignOut";
import { ProtectedRoute } from "../../services/PotectedRouter";
import ProfileFreelancer from "../../pages/Profiles/ProfileFreelancer/ProfileFreelancer";
import { FreelancerCompleteForm } from "../Forms/FreelancerCompleteForm/FreelancerCompleteForm";
import { EmployerCompleteForm } from '../Forms/EmployerCompleteForm/EmployerCompleteForm';
import "./App.css";
import ResetPass from "../../pages/ResetPass/ResetPass";
import ProfileCustomer from "../../pages/Profiles/ProfileCustomer/ProfileCustomer";
import { userCustomer, userFreelancer } from "../../utils/constants"
import ProfileFreelancerViewOnly from "../../pages/Profiles/ProfileFreelancerViewOnly/ProfileFreelancerViewOnly";
import { CreateTaskForm } from '../Forms/CreateTaskForm/CreateTaskForm';
import Order from "../../pages/Order/Order";

function App() {
  const [authenticated, setAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState(userFreelancer);
  //состояние отображения фильтра поиска
  const [orderFilter, setOrderFilter] = useState(true);

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
    <BrowserRouter>
      <Context.Provider value={{ currentUser, authenticated, orderFilter, updateUser, logIn, logOut, handleOrderFilter }}>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                setAuthenticated={setAuthenticated}
                setCurrentUser={setCurrentUser}
              />}>
            <Route element={<ProtectedRoute />}>
              <Route path="customer/:id" element={<ProfileCustomer />} />
              <Route path="freelancer/:id" element={<ProfileFreelancer />} />
            </Route>
            <Route path="profile-freelancer" element={<ProfileFreelancerViewOnly />} />
            <Route path="create-task" element={<CreateTaskForm />} />
            <Route path="customer/:id/complete" element={<EmployerCompleteForm />} />
            <Route index element={<Main />} />
            <Route path="signup" element={<Register />} />
            <Route path="order" element={<Order />} />
            <Route
              path="signup/freelancer"
              element={
                <FreelancerCompleteForm
                  setAuthenticated={setAuthenticated}
                  setCurrentUser={setCurrentUser}
                />} />
            <Route
              path="signin"
              element={
                <Login
                  setAuthenticated={setAuthenticated}
                  setCurrentUser={setCurrentUser}
                />}
            />
            <Route path="forgot-password" element={<ForgotPass />} />
            <Route path="reset-password" element={<ResetPass />} />
            <Route path="signout" element={<SignOut />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Context.Provider>
    </BrowserRouter>
  );
}

export default App;
