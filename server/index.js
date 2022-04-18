const PORT = 8000
const express = require('express')
const { MongoClient } = require('mongodb')
const { v4:uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcrypt')

const uri = 'mongodb+srv://andrewb:Terminator2019@cluster0.sqs5v.mongodb.net/Cluster0?retryWrites=true&w=majority'

const app = express()
app.use(cors())  // to enable CORS
app.use(express.json()) // to enable parsing data which are coming from frontend

app.get('/', (req, res) => {
    res.json('Hello in my App')
})

// 
app.post('/signup', async (req, res) => {
    const client = new MongoClient(uri)
    const { email, password } = req.body
    console.log(req.body);

    const generatedUserId = uuidv4()  // generating uniq id for user
    const hashedPassword = await bcrypt.hash(password, 10)  // return a hashed password.

    try {
        await client.connect()
        const database = client.db('app-data')
        const users = database.collection('users')

        const existingUser = await users.findOne({ email }) // check if user with entered email is exist
        // if user already exists - return 409 status with message
        if(existingUser) {
            return res.status(409).send('User already exists. Please login')
        }

        const sanitizedEmail = email.toLowerCase()

        // data object to send to DB
        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            hashed_password: hashedPassword
        }

        // send data to DB
        const insertedUser = await users.insertOne(data)

        // generate token and it is going to expire in 24 hours
        const token = jwt.sign(insertedUser, sanitizedEmail, {
            expiresIn: 60 *24
        })

        // return status after request
        res.status(201).json({ token, userId: generatedUserId, email: sanitizedEmail })
    } catch (err) {
        console.log(err);
    }
})


// get array of the users
app.get('/users', async(req, res) => {
    const client = new MongoClient(uri)

    try {
        await client.connect()  // connect to URI
        const database = client.db('app-data') // get access to DB
        const users = database.collection('users') // get access to collection

        const returnedUsers = await users.find().toArray() // convert collection to an array
        res.send(returnedUsers)
    } finally {
        await client.close()  // close the access to collection after request or if there is a error
    }

})

app.listen(PORT, () => console.log('Server running on PORT ' + PORT))