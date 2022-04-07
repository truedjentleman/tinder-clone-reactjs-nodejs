import whiteLogo from "../assets/images/tinder-logo-white.png";
import colorLogo from "../assets/images/tinder-logo-color.png";

const Nav = ({ minimal, authToken, setShowModal, showModal }) => {

    const handleClick = () => {
        setShowModal(true);
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
