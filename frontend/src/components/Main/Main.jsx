import "./Main.css";
import React from "react";
import StartWork from "../StartWork/StartWork";
import OperationMode from "../OperationMode/OperationMode";
import FreelanceOrder from "../FreelanceOrder/FreelanceOrder";

function Main() {
  return (
    <main className="content">
      <StartWork />
      <OperationMode />
      <FreelanceOrder/>
    </main>
  );
}

export default Main;