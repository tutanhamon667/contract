import "./Main.css";
import React from "react";
import StartWork from "../StartWork/StartWork";
import OperationMode from "../OperationMode/OperationMode";

function Main() {
  return (
    <main className="content">
      <StartWork />
      <OperationMode />
    </main>
  );
}

export default Main;