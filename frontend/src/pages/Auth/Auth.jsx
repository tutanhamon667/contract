import React from "react";
import "./Auth.css";

const Auth = () => {
  return (
    <div className="wrapper">
      <div className="register__container">
        <h1 className="title">Регистрация</h1>
        <div className="register">
          <form className="register__form">
            <div className="register__statusNameContainer">
              <div className="register__statusNameLeft">
                <label className="register__radioButtonLabel">
                  <input
                    className="register__radioButton"
                    id="customer"
                    type="radio"
                  />
                  <span className="register__radioButtonFake"></span>
                  <span className="register__radioButtonText">Я заказчик</span>
                  </label>
                <input className="register__nameInput" type="text" />
              </div>

              <div className="register__statusNameRight">
              <label className="register__radioButtonLabel">
                  <input
                    className="register__radioButton"
                    id="freelancer"
                    type="radio"
                  />
                  <span className="register__radioButtonFake"></span>
                  <span className="register__radioButtonText">Я фрилансер</span>
                  </label>

                <input className="register__nameInput" type="text" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
