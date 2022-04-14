import { useState } from "react";
import AuthModal from "../components/AuthModal";

import Nav from "../components/Nav";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const authToken = false;

  const handleClick = () => {
    setShowModal(true);
    setIsSignUp(true);  // reset isSignUp state to defaulf 'true' value after closing authModal
  };

  return (
    <div className="overlay">
      <Nav
        minimal={false}
        setShowModal={setShowModal}
        showModal={showModal}
        setIsSignUp={setIsSignUp}
      />
      <div className="home">
        <h1 className="primary-title">Swipe Right®</h1>
        <button className="primary-button" onClick={handleClick}>
          {authToken ? "Sign out" : "Create Account"}
        </button>
        {showModal && (
          <AuthModal
            setShowModal={setShowModal}
            isSignUp={isSignUp}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
