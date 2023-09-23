import React from "react";
import Main from "../Main/Main";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Layout from "../../layout/Layout";
import NotFound from "../../pages/NotFound/NotFound";
// import { ProtectedRoute } from "../../services/PotectedRouter";
import FreelancerAccount from "../FreelancerAccount/FreelancerAccount";
import { CurrentUser } from "../../context/context"

function App() {
  const [authenticated, setAuthenticated] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState({
    id: "5",
    firstName: "Иван",
    lastName: "Петров",
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
    // Тут должна быть логика по авторизации(получение/проверка/запись токена и тд)
    setAuthenticated(true);
  };
  const logOut = () => {
    // Тут должна быть логика по удалению токена и закрытию сессии
    setAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <CurrentUser.Provider value={currentUser}>
        <Routes>
          <Route path="/" element={<Layout authenticated={authenticated} />}>
            {/* Тут будут защищенные роуты */}
            {/* <Route element={<ProtectedRoute />}></Route> */}
            <Route index element={<Main />} />
            <Route path="freelancer/:freelancerId" element={<FreelancerAccount updateUser={updateUser} />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CurrentUser.Provider>
    </BrowserRouter>
  );
}

export default App;
