import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const ChatHeader = ({ user }) => {
    const [cookies, setCookie, removeCookie] = useCookies(["user"]);

    const navigate = useNavigate();

    const logout = () => {
        removeCookie('UserId', cookies.UserId)
        removeCookie('AuthToken', cookies.AuthToken)
        navigate("/");
        window.location.reload() // reload the window after log out

    }

    return (
        <div className="chat-container-header">
            <div className="profile">
                <div className="image-container">
                    <img src={user.url} alt={'photo of ' + user.first_name}/>
                </div>
                <h3>{user.first_name}</h3>
            </div>
            {/* remove Cookies on click Log Out button */}
            <i className="log-out-icon" onClick={logout}>Logout</i>
        </div>
    );
};

export default ChatHeader;