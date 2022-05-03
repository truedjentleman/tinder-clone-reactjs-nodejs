import { useState } from "react";
import ChatDisplay from "./ChatDisplay";
import ChatHeader from "./ChatHeader";
import MatchesDisplay from "./MatchesDisplay";

const ChatContainer = ({ user }) => {
  const [clickedUser, setClickedUser] = useState(null); // state for user clicked in 'Matches' part

    // console.log('clicked user', clickedUser); //  DEBUG

  return (
    <div className="chat-container">
      <ChatHeader user={user} />

      <div className="chat-container-matches-menu">
        <button className="option" onClick={() => setClickedUser(null)}>
          Matches
        </button>
        <button className="option" disabled={!clickedUser}>
          Chat
        </button>
      </div>

      {!clickedUser && (
        <MatchesDisplay
          matches={user.matches}
          setClickedUser={setClickedUser}
        />
      )}

      {clickedUser && <ChatDisplay user={user} clickedUser={clickedUser}/>}
    </div>
  );
};

export default ChatContainer;
