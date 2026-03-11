const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const corsOptions = {
    origin: 'http://localhost:5173',
}

app.use(express.json());
app.use(cors(corsOptions));
dotenv.config({
    path: '../.env'
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});



app.get('/', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

// LOGIN AND SIGNUP ENDPOINTS

app.post('/signup-user', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).json({ error: 'Error inserting user' });
        } else {
            res.status(201).json({ message: 'User created successfully' });
        }
    });
});