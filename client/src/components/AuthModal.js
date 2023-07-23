import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";

const AuthModal = ({ setShowModal, isSignUp }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [error, setError] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const navigate = useNavigate();

  const handleClick = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp && password !== confirmPassword) {
        setError("Passwords need to match");
        return;
      }
      // console.log('posting', email, password); // DEBUG
      // request to backend to signup and pass through the email and password as a request's body parameters
      const response = await axios.post(
        `http://localhost:8000/${isSignUp ? "signup" : "login"}`,
        {
          email,
          password,
        }
      );

      // ---- Cookies handling ----  //
      // setCookie("Email", response.data.email); // DEBUG
      setCookie("UserId", response.data.userId);
      setCookie("AuthToken", response.data.token);

      // check if response status == 201, if so then success = true
      const success = response.status === 201;
      if (success && isSignUp) navigate("/onboarding"); // navigate to 'onboarding' page if signup is successful
      if (success && !isSignUp) navigate("/dashboard"); // navigate to 'dashboard' page if login (not signUp) is successful

      window.location.reload() // reload the window after log in to make sure that authToken gets read by 'onboarding' and 'dashboard' pages
    
    } catch (error) {
      console.log(error);
    }
  };

  // console.log(email, password, confirmPassword);  // DEBUG

  return (
    <div className="auth-modal">
      <div className="close-icon" onClick={handleClick}>
        ⮾
      </div>
      <h2>{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}</h2>
      <p>
        By clicking Log in, you agree to our terms. Learn how we process your
        data in our Privacy and Cookie Policy{" "}
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignUp && (
          <input
            type="password"
            id="password-check"
            name="password-check"
            placeholder="confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <input className="secondary-button" type="submit" value="Submit"/>
        <p>{error}</p>
      </form>
      <hr />
      <h2>GET THE APP</h2>
    </div>
  );
};

export default AuthModal;
