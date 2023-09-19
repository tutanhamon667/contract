import React from "react";
import Main from "../Main/Main";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Layout from "../../layout/layout";
import NotFound from "../../pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Тут будут защищенные роуты */}
          {/* <Route element={<ProtectedRoute />}></Route> */}
          <Route path="/" element={<Main />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
