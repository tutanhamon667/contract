import "./App.css";
import React from "react";
import Header from "../Header/Header";
import Main from "../Main/Main";

function App() {
  return (
      <div className="app">
        <div className="page">
          <Header />
          <Main />
        </div>
      </div>
  );
}

export default App;
