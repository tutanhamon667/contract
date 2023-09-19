import React from "react";
import Header from "../Header/Header";
import Main from "../Main/Main";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
          <Header />
          <Main />
    </BrowserRouter>
  );
}

export default App;
