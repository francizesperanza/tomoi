const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const session = require('express-session');
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));
dotenv.config({
    path: '../.env'
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;

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
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            
            res.status(500).json({ error: 'Error inserting user' });
        } else {
            res.status(201).json({ message: 'User created successfully' });
        }
    });
});

app.post('/login-user', (req, res) => {
    const { username, password } = req.body;
    if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
        res.status(400).json({ error: 'Invalid username or password format' });
        return;
    }

    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error logging in' });
        } else {
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (err, isMatch) => {
                    if (err) {
                        res.status(500).json({ error: 'Error logging in' });
                    } else if (isMatch) {
                        req.session.user = { userID: result[0].userID, username: result[0].username, email: result[0].email };
                        res.status(200).json({ message: 'Login successful' });
                    } else {
                        res.status(401).json({ error: 'Invalid username or password' });
                    }
                });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        }
    });
});

app.get('/check-username', (req, res) => {
    const { username } = req.query;
    const query = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error checking username:', err);
            res.status(500).json({ error: 'Error checking username' });
        } else {
            const isAvailable = result[0].count === 0;
            res.json({ isAvailable });
        }
    });
});

app.get('/check-email', (req, res) => {
    const { email } = req.query;
    const query = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error checking email:', err);
            res.status(500).json({ error: 'Error checking email' });
        } else {
            const isAvailable = result[0].count === 0;
            res.json({ isAvailable });
        }
    });
});
