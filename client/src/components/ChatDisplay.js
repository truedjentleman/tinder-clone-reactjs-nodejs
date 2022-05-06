import axios from "axios";
import { useEffect, useState } from "react";

import Chat from "./Chat";
import ChatInput from "./ChatInput";

const ChatDisplay = ({ user, clickedUser }) => {
  const [usersMessages, setUsersMessages] = useState(null);
  const [clickedUsersMessages, setClickedUsersMessages] = useState(null);
  const userId = user?.user_id;
  const clickedUserId = clickedUser?.user_id;

  const getUsersMessages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/messages", {
        params: { userId: userId, correspondingUserId: clickedUserId },
      });
      setUsersMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getClickedUsersMessages = async () => {
    try {
      const response = await axios.get("http://localhost:8000/messages", {
        params: { userId: clickedUserId, correspondingUserId: userId },
      });
      setClickedUsersMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsersMessages(); // to get messages from logged in user to 'matched user' and set the STATE
    getClickedUsersMessages(); // to get messages from 'matched user' to logged in user and set the STATE
  }, []);

  // MESSAGES ARRAY FORMATTING AND SORTING
  const messages = []; // create an empty array for formatted messages

  usersMessages?.forEach((message) => {
    const formattedMessage = {}; // create empty object
    // set object's properties
    formattedMessage["name"] = user?.first_name;
    formattedMessage["img"] = user?.url;
    formattedMessage["message"] = message.message;
    formattedMessage["timestamp"] = message.timestamp;
    messages.push(formattedMessage);
  });

  clickedUsersMessages?.forEach((message) => {
    const formattedMessage = {}; // create empty object
    // set object's properties
    formattedMessage["name"] = clickedUser?.first_name;
    formattedMessage["img"] = clickedUser?.url;
    formattedMessage["message"] = message.message;
    formattedMessage["timestamp"] = message.timestamp;
    messages.push(formattedMessage);
  });

  // DEBUG
  /*console.log('usersMessages', usersMessages);
    console.log('usersMessages', clickedUsersMessages);
    console.log('formattedMessages', messages); */
    

  // Sorting messages array of objects using localeCompare() - return negative or positive number
  const formOldToNewOrderMessages = messages?.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );

  return (
    <>
      <Chat formOldToNewOrderMessages={formOldToNewOrderMessages} />
      <ChatInput
        user={user}
        clickedUser={clickedUser}
        getUsersMessages={getUsersMessages}
        getClickedUsersMessages={getClickedUsersMessages}
      />
    </>
  );
};

export default ChatDisplay;
