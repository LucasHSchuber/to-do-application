import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import fp from "../assets/images/diaphragm_black.png";

// Determine the base URL based on the environment
const apiBaseUrl = process.env.NODE_ENV === 'development'
  ? '/index.php'
  : 'https://backend.expressbild.org/index.php';


function Login_window() {
  //define states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [errorLogginginMessage, setErrorLogginginMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);

  const navigate = useNavigate();

  

  //lget localstorage variables
  useEffect(() => {
    setUsername(
      localStorage.getItem("username") ? localStorage.getItem("username") : "",
    );
  }, []);

  //load loading bar on load
  useEffect(() => {
    // Check if the loading bar has been shown before
    const hasLoginLoadingBarShown = sessionStorage.getItem(
      "hasLoginLoadingBarShown",
    );
    // If it has not been shown before, show the loading bar
    if (!hasLoginLoadingBarShown) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem("hasLoginLoadingBarShown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    console.log("e.target.value");
    setUsernameMessage("");
    setErrorLogginginMessage("");
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    console.log("e.target.value");
    setPasswordMessage("");
    setErrorLogginginMessage("");
  };

  const loginUser = async () => {
    if (password === "" && username === "") {
      console.log("Enter username and password");
      setPasswordMessage(true);
      setUsernameMessage(true);
      setErrorLogginginMessage("");
    }
    if (password === "") {
      console.log("Enter password");
      setPasswordMessage(true);
    } else {
      setPasswordMessage("");
    }
    if (username === "") {
      console.log("Enter username");
      setUsernameMessage(true);
    } else {
      setUsernameMessage("");
    }

    if (password !== "" && username !== "") {
      console.log("password and username entered");

      const data = { 
        email: username, 
        password: password 
      };
      console.log(data);
      try {
        // First check user to global database if internet
        if (navigator.onLine){
          const response = await axios.post(`${apiBaseUrl}/rest/photographer_portal/login`, data, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          });
          console.log('response', response);

          if (response.status === 200) {
            console.log('GLOBAL DATABSE USER OK');
          } else {
            console.log('GLOBAL DATABSE USER NOT OK');
          }
        }

      } catch (error) {
         // Username exists in global database
         if (error.response.status === 403) {
          console.log('response:', error.response.data.error);
         } else { // Username does not exists in global database
          console.log("user does not exists in local database or global database");
          setErrorLogginginMessage("User not found. Try another email or contact ExpressBild for further help.");
          return;
         }
      }

      try {
        // Then check user to local database
        const data = { 
          email: username, 
          password: password 
        };

        const responseData = await window.api.loginUser(data);
        console.log(responseData);

        if (responseData.status === 200) {
          console.log("Log in successful");
          localStorage.setItem("user_id", responseData.user.user_id);
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);
          localStorage.setItem("token", responseData.user.token);
          // close login window and open mainWindow
          setIsLoadingConfirm(true);
          const timeout = setTimeout(() => {
            window.api.createMainWindow();
          }, 2400);
        } else if (responseData.status === 202) { // User not found in local database
          console.log("User not found in local database");
          setErrorLogginginMessage("Activate your account by clicking the 'Activate account' button below.");
        } else {
          console.log("Invalid username or/and password");
          setErrorLogginginMessage("Invalid password.");
        }
      } catch (error) {
        console.log("error:", error);
      }
    } else {
      console.error("Password or Username is missing");
      return null;
    }
  };

  if (isLoading) {
    // Render loading indicator while content is loading
    return (
      <div>
        <div className="spinning-logo-login">
          <img src={fp} alt="fotografportalen" />
          <p>
            <em>Photographer Portal</em>
          </p>
        </div>
        {/* <div className="loading-bar-text">
          <p><b>Loading..</b></p>
        </div> */}
        {/* <div className="loading-bar-container-login">
          <div className="loading-bar-login"></div>
        </div> */}
      </div>
    );
  }

  if (isLoadingConfirm) {
    // Render loading indicator while content is loading
    return (
      <div>
        <div className="spinning-logo-login" style={{ marginTop: "6em" }}>
          {/* <p><b>Successfull!</b> <br></br><em>Signing in...</em></p> */}
          <p>
            <em>Signing in...</em>
          </p>
        </div>
        <div className="loading-bar-container-login">
          <div className="loading-bar-login"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login_window-wrapper">
      <div className="login_window-content">
        <h5 className="mb-3 mr-3">
          <b>Log in</b>
        </h5>
        <div style={{ textAlign: "left", width: "110%", marginLeft: "-1.5em" }}>
          {usernameMessage || passwordMessage || errorLogginginMessage ? (
            <ul className="error">
              {/* {usernameMessage ? <li>{usernameMessage}</li> : ""}
                {passwordMessage ? <li>{passwordMessage}</li> : ""} */}
              {errorLogginginMessage ? <li>{errorLogginginMessage}</li> : ""}
            </ul>
          ) : (
            <></>
          )}
        </div>
        <div>
          <div>
            <input
              className={`form-input-field-login ${usernameMessage ? "error-border" : ""}`}
              placeholder="Email"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loginUser();
                }
              }}
            />
          </div>
          <div>
            <input
              className={`form-input-field-login ${passwordMessage ? "error-border" : ""}`}
              placeholder="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loginUser();
                }
              }}
            />
          </div>
        </div>

        <div>
          <button
            className="button normal fixed-width mt-3 mb-2"
            onClick={loginUser}
          >
            Log in
          </button>
          <button
            className="button activate-account-button fixed-width mb-2"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register_window");
            }}
          >
            Activate account
          </button>
        </div>
        {/* <a
          href="#"
          role="button"
          className="register-link-login"
          onClick={(e) => {
            e.preventDefault();
            navigate("/register_window");
          }}
          style={{ color: "black" }}
        >
          Dont have an account? Register here!
        </a> */}
      </div>
    </div>
  );
}

export default Login_window;
