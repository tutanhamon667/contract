import React from "react";
import Main from "../Main/Main";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Layout from "../../layout/layout";
import NotFound from "../../pages/NotFound/NotFound";
import Auth from "../../pages/Auth";
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
        <Route path="/" element={<Layout />}>
          {/* Тут будут защищенные роуты */}
          {/* <Route element={<ProtectedRoute />}></Route> */}
          <Route path="/signin" element={<Auth />} />
          <Route path="/" element={<Main />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
