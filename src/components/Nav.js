import whiteLogo from "../assets/images/tinder-logo-white.png";
import colorLogo from "../assets/images/tinder-logo-color.png";

const Nav = ({ minimal, authToken, setShowModal, showModal, setIsSignUp }) => {

    const handleClick = () => {
        setShowModal(true);
        setIsSignUp(false); // when we logging in the auth modal window will be slightly different  
    };

  return (
    <nav>
      <div className="logo-container">
        <img
          className="logo"
          src={minimal ? colorLogo : whiteLogo}
          alt="logo"
        />
      </div>
      {!authToken && !minimal && (
        <button className="nav-button" onClick={handleClick} disabled={showModal}>
          Log in
        </button>
      )}
    </nav>
  );
};

export default Nav;
