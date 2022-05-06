import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const MatchesDisplay = ({ matches, setClickedUser }) => {
  
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  const [matchedProfiles, setMatchedProfiles] = useState(null);

  const matchedUserIds = matches.map(({ user_id }) => user_id); // get array of matched user_ids
  const userId = cookies.UserId

  const getMatches = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users", {
        // send to server stringified array as a request params - userIds
        params: { userIds: JSON.stringify(matchedUserIds) },
      });

      setMatchedProfiles(response.data); // get the matched users objects array
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    getMatches();
    return () => controller.abort();

  }, [matches]);   // TODO:update if needed

  //console.log(matchedProfiles); // DEBUG

  // filter out the users only if they have matched the current user too, if both people match
  // check in matched profiles users that have in property 'matches' current user's ID
  const filteredBothMatchesProfiles = matchedProfiles?.filter(
    (matchedProfile) =>   // check if returned  filtered array not empty, it's only if matched user has in 'matches' current user's ID
      matchedProfile.matches.filter(
        (profile) =>     // return array with current user's ID or empty array if not found
          profile.user_id === userId).length > 0   
  )

  return (
    <div className="matches-display">
      {filteredBothMatchesProfiles?.map((match) => (
        <div
          key={match.user_id}
          className="match-card"
          onClick={() => setClickedUser(match)}
        >
          <div className="image-container">
            <img src={match?.url} alt={match?.first_name + " profile"} />
          </div>
          <h3>{match?.first_name}</h3>
        </div>
      ))}
    </div>
  );
};

export default MatchesDisplay;
