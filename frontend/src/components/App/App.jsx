import React from "react";
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
import FreelancerAccount from "../FreelancerAccount/FreelancerAccount";
import { FreelancerCompleteForm } from "../Forms/FreelancerCompleteForm/FreelancerCompleteForm";
import "./App.css";

function App() {
  // const [authenticated, setAuthenticated] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({
    id: "5",
    first_name: "Иван",
    last_name: "Петров",
    email: "email@mail.ru",
    password: "topSecret"
  });

  function updateUser(userEmail) {
    setCurrentUser({
      ...currentUser,
      email: userEmail.email
    })
  }

  const logIn = () => {
    setAuthenticated(true);
  };

  const logOut = () => {
    setAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Context.Provider value={{currentUser, authenticated, updateUser, logIn, logOut}}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route path="freelancer/:freelancerId" element={<FreelancerAccount />} />
              <Route path="freelancer/:freelancerId/complete" element={<FreelancerCompleteForm />} />
            </Route>
            <Route index element={<Main />} />
            <Route path="signup" element={<Register />} />
            <Route path="signin" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPass />} />
            <Route path="signout" element={<SignOut />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Context.Provider>
    </BrowserRouter>
  );
}

export default App;
