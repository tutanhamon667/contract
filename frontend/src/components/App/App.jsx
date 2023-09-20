import React from "react";
import Main from "../Main/Main";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Layout from "../../layout/Layout";
import NotFound from "../../pages/NotFound/NotFound";
import Register from "../../pages/Register/Register";
import Login from "../../pages/Login/Login";
// import { ProtectedRoute } from "../../services/PotectedRouter";

function App() {
  const [authenticated, setAuthenticated] = React.useState(true);

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
      <Routes>
        <Route path="/" element={<Layout authenticated={authenticated} />}>
          {/* Тут будут защищенные роуты */}
          {/* <Route element={<ProtectedRoute />}></Route> */}
          <Route index element={<Main />} />
          <Route path="signup" element={<Register />} />
          <Route path="signin" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
