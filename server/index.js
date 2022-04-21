const PORT = 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const uri =
  "mongodb+srv://andrewb:Terminator2019@cluster0.sqs5v.mongodb.net/Cluster0?retryWrites=true&w=majority";

const app = express();
app.use(cors()); // to enable CORS
app.use(express.json()); // to enable parsing data which are coming from frontend

app.get("/", (req, res) => {
  res.json("Hello in my App");
});


// SIGNUP
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


// LOGIN
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
    }
    res.status(400).send("Invalid credentials");
  } catch (err) {
    console.log(err);
  }
});


// GET the individual user information
app.get('/user', async (req, res) => {
  const client = new MongoClient(uri)
  const userId = req.query.userId

  console.log(req.query); // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    const query = { user_id: userId }  // query for user search
    const user = await users.findOne(query); // search user by query (userId)
    res.send(user)  // send back to front
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
})


// GET array of the USERS filtered by GENDER
app.get("/gendered-users", async (req, res) => {
  const client = new MongoClient(uri);
  const gender = req.query.gender

  console.log('gender', gender);

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection
    const queryByGender = { gender_identity: {$eq : gender}}
    const foundUsers = await users.find(queryByGender).toArray() // convert found collection to an array

    res.send(foundUsers);  // send back to front
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
});


// UPDATE USER Object - PUT
app.put("/user", async (req, res) => {
  const client = new MongoClient(uri);
  const formData = req.body.formData; // get the data from request body

//   console.log(formData); // DEBUG

  try {
    await client.connect(); // connect to URI
    const database = client.db("app-data"); // get access to DB
    const users = database.collection("users"); // get access to collection

    const query = { user_id: formData.user_id }; // looking for the user by user_id from formData
    console.log(query);
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
    // update the user info in DB
    const insertedUser = await users.updateOne(query, updateDocument);
    res.send(insertedUser);
  } finally {
    await client.close(); // close the access to collection after request or if there is a error
  }
});

app.listen(PORT, () => console.log("Server running on PORT " + PORT));
