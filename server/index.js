const PORT = 8000
const express = require('express')
const { MongoClient } = require('mongodb')
const uri = 'mongodb+srv://andrewb:Terminator2019@cluster0.sqs5v.mongodb.net/Cluster0?retryWrites=true&w=majority'

const app = express()

app.get('/', (req, res) => {
    res.json('Hello in my App')
})

// 
app.post('/signup', (req, res) => {
    res.json('Hello in my App')
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