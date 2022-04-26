import TinderCard from "react-tinder-card";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

import ChatContainer from "../components/ChatContainer"

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [genderedUsers, setGenderedUsers] = useState(null)
  const [lastDirection, setLastDirection] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const userId = cookies.UserId

  // GET user data based on UserId
  const getUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user', {
        params: {userId}
      })
      setUser(response.data)  // set User based on response
    } catch (error) {
      console.log(error);
    }
  }

  // GET gendered users based on user's gender interest
  const getGenderedUsers = async() => {
    try {
      const response = await axios.get('http://localhost:8000/gendered-users', {
        params: {gender: user?.gender_interest}
      })
      setGenderedUsers(response.data)
    } catch (error) {
      console.log(error);
    }
  }

    
  // USE EFFECT
  useEffect(() => {
    getUser()
  }, [])  // TODO:update if needed

  useEffect(() => {
    if(user) {
      getGenderedUsers()
    }
  }, [user])  // TODO:update if needed

  // console.log('user', user);  // DEBUG
  // console.log('gendered users', genderedUsers); // DEBUG

   
  
  // PUT - to update 'swiped right' users in DB
  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put('http://localhost:8000/addmatch', {
        userId,
        matchedUserId
      })

      getUser()  // get user data again after updating matches
      
    } catch (error) {
      console.log(error);
    }
  }


  const swiped = (direction, swipedUserId) => {

    if (direction === "right") {
      updateMatches(swipedUserId)
    }

    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  // to get user_ids of matched users from user object (user.matches array) and add user's own user_id
  const matchedUserIdsPlusMe = user?.matches.map(({ user_id }) => user_id).concat(userId)

  // filter already matched users (including user it self), so that they are not showing up in 'Tinder Card' as a recommendations
  const filteredGenderedUsers = genderedUsers?.filter(
    genderedUser => !matchedUserIdsPlusMe.includes(genderedUser.user_id)
  )

  return (
    <>
     {user && <div className="dashboard">
        <ChatContainer user={user}/>
        <div className="swipe-container">
          <div className="card-container">
            {filteredGenderedUsers?.map((genderedUser) => 
              <TinderCard
                className="swipe"
                key={genderedUser.user_id}
                onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}
              >
                <div
                  style={{ backgroundImage: "url(" + genderedUser.url + ")" }}
                  className="card"
                >
                  <h3>{genderedUser.first_name}</h3>
                </div>
              </TinderCard>
            )}
            <div className="swipe-info">
                {lastDirection ? <p>You swiped {lastDirection}</p> : <p></p>}
            </div>
          </div>
        </div>
      </div>}
    </>
  );
};

export default Dashboard;
