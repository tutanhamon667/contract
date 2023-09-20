import React from "react";
import "./Auth.css";

const Auth = () => {
  return (
    <>
      <div className="wrapper">
        <h1 className="title">Регистрация</h1>
        <div className="register">
          <form className="register__form">
            <div className="register__statusNameContainer">
              <div className="register__statusNameLeft">
                <label>
                  <input
                    className="register__statusInput"
                    type="radio"
                    name="options"
                    value="customer"
                    // checked={selectedOption === 'option1'}
                    // onChange={handleOptionChange}
                  />
                  Я заказчик
                </label>
                <input className="register__nameInput" type="text" />
              </div>

              <div className="register__statusNameRight">
                <label>
                  <input
                    type="radio"
                    name="options"
                    value="freelancer"
                    // checked={selectedOption === 'option2'}
                    // onChange={handleOptionChange}
                  />
                  Я фрилансер
                </label>
              </div>
            </div>

            <input className="register__nameInput" type="text" />
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth;
