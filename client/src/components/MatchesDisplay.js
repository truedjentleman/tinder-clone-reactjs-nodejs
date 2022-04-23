import { useEffect, useState } from "react";
import axios from "axios";

const MatchesDisplay = ({ matches, setClickedUser }) => {
  const [matchedProfiles, setMatchedProfiles] = useState(null);

  const matchedUserIds = matches.map(({ user_id }) => user_id); // get array of matched user_ids

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
    getMatches();
  }, []);

  //console.log(matchedProfiles); // DEBUG

  return (
    <div className="matches-display">
      {matchedProfiles?.map((match, _index) => (
        <div
          key={_index}
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
