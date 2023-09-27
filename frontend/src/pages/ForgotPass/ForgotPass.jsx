import React from "react";
import ForgotPassForm from "../../components/Forms/ForgotPassForm/ForgotPassForm";
import SetNewPassForm from "../../components/Forms/SetNewPassForm/SetNewPassForm";

const ForgotPass = () => {
  const [isConfirmed, setIsConfirmed] = React.useState(false);
console.log(isConfirmed);
  return (
    <div className="wrapper">
      <div className="container">
        {!isConfirmed && <h1 className="title">Забыли пароль?</h1>}
        {!isConfirmed ? <ForgotPassForm func={()=>setIsConfirmed(true)}/> : <SetNewPassForm/>} 
      </div>
    </div>
  );
};

export default ForgotPass;
