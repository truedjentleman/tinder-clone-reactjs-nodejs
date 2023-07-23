const PORT = 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config()


const uri = process.env.URI

const app = express();
app.use(cors()); // to enable CORS
app.use(express.json()); // to enable parsing data which are coming from frontend

app.get("/", (req, res) => {
  res.json("Hello in my App");
});


// SIGNUP - POST request
app.post("/signup", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;
  // console.log(req.body); // DEBUG

  const generatedUserId = uuidv4(); // generating uniq id for user
  const hashedPassword = await bcrypt.hash(password, 10); // return a hashed password.

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const existingUser = await users.findOne({ email }); // check if user with entered email is exist
    // if user already exists - return 409 status with message
    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();

    // data object to send to DB
    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
    };

    // send data to DB
    const insertedUser = await users.insertOne(data);

    // generate token and it is going to expire in 24 hours
    const token = jwt.sign(insertedUser, sanitizedEmail, {
      expiresIn: 60 * 24,
    });

    // return status after request and send token from response
    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.log(err);
  }
});


// LOGIN - POST request
app.post("/login", async (req, res) => {
  const client = new MongoClient(uri);
  const { email, password } = req.body;

  try {
    await client.connect(); // connect to DB URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    //find user by email - async operation
    const user = await users.findOne({ email });

    // Correct password - check if password is correct - compare hashed passwords, local and remote via bcrypt
    const correctPassword = await bcrypt.compare(
      password,
      user.hashed_password
    );

    // if user exists and password is correct - create token
    if (user && correctPassword) {
      const token = jwt.sign(user, email, {
        expiresIn: 60 * 24,
      });
      res.status(201).json({ token, userId: user.user_id });
    } else res.status(400).send("Invalid credentials");
  } catch (err) {
    console.log(err);
  }
});


// GET the individual user information
app.get('/user', async (req, res) => {
  const client = new MongoClient(uri)
  const userId = req.query.userId  // get data from frontend - from req body (params)

  // console.log(req.query); // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    const query = { user_id: userId }  // query for user search  - by userId
    const user = await users.findOne(query); // search user by query (userId)
    res.send(user)  // send back to frontend ( get this back in our frontend)
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
})


// GET matched users information
app.get('/users', async (req, res) => {
  const client = new MongoClient(uri)
  const userIds = JSON.parse(req.query.userIds) // get stringified array form frontend and parse it to array
  // console.log(userIds); // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection of users

    const pipeline =
      [
        {
          '$match': {
            'user_id': {
              '$in': userIds
            }
          }
        }
      ]
    const foundUsers = await users.aggregate(pipeline).toArray()  // get the users from collection based on a pipeline and turn this to Array 
    // console.log(foundUsers)
    res.send(foundUsers) // send back to frontend ( get this back in our frontend)

  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
})


// GET array of the USERS filtered by GENDER
app.get("/gendered-users", async (req, res) => {
  const client = new MongoClient(uri);
  const gender = req.query.gender  // get data from frontend - from req body (params)
 
  // console.log('gender', gender);  // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection
    const queryByGender = { gender_identity: {$eq : gender}}   // query by gender
    const foundUsers = await users.find(queryByGender).toArray() // convert found collection to an array

    res.send(foundUsers);  // send back to frontend ( get this back in our frontend)
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
});


// UPDATE USER Object - PUT
app.put("/user", async (req, res) => {
  const client = new MongoClient(uri);
  const formData = req.body.formData; // get data from frontend - from req body (params)

//   console.log(formData); // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    const query = { user_id: formData.user_id }; // looking for the user by user_id from formData
    // console.log(query); // DEBUG
    const updateDocument = {
      $set: {
        first_name: formData.first_name,
        dob_day: formData.dob_day,
        dob_month: formData.dob_month,
        dob_year: formData.dob_year,
        show_gender: formData.show_gender,
        gender_identity: formData.gender_identity,
        gender_interest: formData.gender_interest,
        url: formData.url,
        about: formData.about,
        matches: formData.matches,
      },
    }
    // update the user's info in DB
    const insertedUser = await users.updateOne(query, updateDocument);
    res.send(insertedUser); // send back to frontend ( get this back in our frontend)
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
});


// UPDATE matched user array for specified user - put
app.put("/addmatch", async (req, res) => {
  const client = new MongoClient(uri)
  const { userId, matchedUserId } = req.body  // get data from frontend - from req body (params)

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    const query = { user_id: userId }  // query by userId - looking for 'signed in' user by ID
    const updateDocument = {
      $push: { matches: {user_id: matchedUserId}}  // append the {user_id: matchedUserId} to 'matches' array
    }

      // update the 'signed in' user's info in DB with 'matches' array
    const user = await users.updateOne(query, updateDocument)
    res.send(user); // send back to frontend (get this back in our frontend)

  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
})



// GET USERS MESSAGES when matched user selection
app.get("/messages", async (req, res) => {
  const client = new MongoClient(uri)   // set the Mongo DB object 
  const { userId, correspondingUserId } = req.query // get data from frontend - from req body (params)

  // console.log(userId, correspondingUserId); // DEBUG

  try {
    await client.connect()  // connect to URI
    const database = client.db("app-data")  // get access to DB
    const messages = database.collection('messages')  // get access to collection

    const query = {
      from_userId: userId, to_userId: correspondingUserId
    }
    const foundMessage = await messages.find(query).toArray()  // put in foundMessages data found based on query and create array of it
    res.send(foundMessage)  // send back to frontend (get this back in our frontend)
  } finally {
    await client.close()
  }
})


// POST message to DB
app.post('/message', async (req, res) => {
  const client = new MongoClient(uri)   // set the Mongo DB object 
  const message = req.body.message

  try {
    await client.connect()  // connect to URI
    const database = client.db("app-data")  // get access to DB
    const messages = database.collection('messages')  // get access to collection

    const insertedMessage = await messages.insertOne(message)  // insert one message into the collection
    res.send(insertedMessage)  // send back to frontend (get this back in our frontend)
    
  } finally {
    await client.close()
  }
})





app.listen(PORT, () => console.log("Server running on PORT " + PORT));