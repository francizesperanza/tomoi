const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const { encrypt, decrypt } = require('./helper');
const { fromBinaryUUID, toBinaryUUID, createBinaryUUID} = require("binary-uuid");
const dayjs = require('dayjs');

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
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }
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
    const uuid = createBinaryUUID();
    const query = 'INSERT INTO users (userID, username, email, password) VALUES (?, ?, ?, ?)';
    db.query(query, [uuid.buffer, username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            console.error('Error inserting user:', err);
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
                        req.session.user = { userID: fromBinaryUUID(result[0].userID), username: result[0].username, email: result[0].email };
                        res.status(200).json({ message: 'Login successful', user: req.session.user});
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

// AUTHENTICATION

app.get('/session-check', (req, res) => {
    if (!req.session.user)
        return res.status(401).json({error: "User is not logged in."});
    return res.json(req.session.user);
})

// ENTRY ENDPOINTS

app.post('/create-entry', (req, res) => {
    const { title, author, content, feeling, dateCreated, lastEdited, tags} = req.body;
    const uuid = createBinaryUUID();
    const encryptedContent = encrypt(process.env.ALGORITHM.toString(), Buffer.from(process.env.ENCRYPT_SECRET, 'hex'), content);

    // creating entry
    const query = 'INSERT INTO posts (postID, author, title, content, feeling, dateCreated, lastEdited) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [uuid.buffer, toBinaryUUID(author), title, encryptedContent, feeling, dateCreated, lastEdited], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Post already exists' });
            }
            console.error('Error inserting post:', err);
            res.status(500).json({ error: 'Error inserting post' });
        }

        // insert tags

        const tagValues = tags.map(tag => [createBinaryUUID().buffer, tag])
        const tagInsertQuery = `INSERT IGNORE INTO tags (tagID, tagName) VALUES ?`

        db.query(tagInsertQuery, [tagValues], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error inserting tags' });
            }

            // get new tags

            const tagSelectQuery = `SELECT tagID, tagName FROM tags WHERE tagName IN (?)`
            
            db.query (tagSelectQuery, [tags], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error selecting tags' });
                }
                
                const pairValues = result.map(tag => [uuid.buffer, tag.tagID])
                // insert into junction table

                const junctionInsertQuery = `INSERT IGNORE INTO post_tags (postID, tagID) VALUES ?`
                
                db.query (junctionInsertQuery, [pairValues], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error inserting into junction table post_tags'})
                    }

                    res.status(201).json({message: 'Entry created successfully'})
                })
            }) 

        })
    });
})

app.put('/edit-entry', (req, res) => {
    const { postID, title, content, feeling, lastEdited, tags} = req.body;
    const idBuffer = Buffer.from(postID.data);
    const encryptedContent = encrypt(process.env.ALGORITHM.toString(), Buffer.from(process.env.ENCRYPT_SECRET, 'hex'), content);

    // creating entry
    const query = 'UPDATE posts SET title = ?, content = ?, feeling = ?, lastEdited = ? WHERE postID = ?';
    db.query(query, [title, encryptedContent, feeling, lastEdited, idBuffer], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ error: 'Error updating post' });
        }

        // delete tags

        const tagValues = tags.map(tag => [createBinaryUUID().buffer, tag])
        const tagDeleteQuery = `DELETE FROM post_tags WHERE postID = ?`

        db.query(tagDeleteQuery, [idBuffer], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error deleting tags' });
            }

            // insert tags
            const tagInsertQuery = `INSERT IGNORE INTO tags (tagID, tagName) VALUES ?`
            db.query(tagInsertQuery, [tagValues], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error inserting tags' });
                }

                // get new tags

                const tagSelectQuery = `SELECT tagID, tagName FROM tags WHERE tagName IN (?)`
                
                db.query (tagSelectQuery, [tags], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error selecting tags' });
                    }
                    
                    const pairValues = result.map(tag => [idBuffer, tag.tagID])
                    // insert into junction table

                    const junctionInsertQuery = `INSERT IGNORE INTO post_tags (postID, tagID) VALUES ?`
                    
                    db.query (junctionInsertQuery, [pairValues], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error inserting into junction table post_tags'})
                        }

                        res.status(201).json({message: 'Entry edited successfully'})
                    })
                }) 
            })
        })
    });
})

app.delete('/delete-entry', (req, res) => {
    const { postID, tags} = req.body;
    const idBuffer = Buffer.from(postID.data);

    // query exclusive tags

    const tagExclusiveQuery = `SELECT pt.tagID FROM post_tags pt WHERE pt.postID = ? AND NOT EXISTS (
                                SELECT 1 FROM post_tags pt2 WHERE pt2.tagID = pt.tagID AND pt2.postID != pt.postID
                            )`

    db.query(tagExclusiveQuery, [idBuffer], (err, exclusiveTags) => {
        if (err) {
            return res.status(500).json({ error: 'Error selecting exclusive tags' });
        }

        if (exclusiveTags.length > 0) {
            // delete tags
            const postTagsDeleteQuery = `DELETE FROM post_tags WHERE postID = ?`
            db.query(postTagsDeleteQuery, [idBuffer], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting from junction table' });
                }

                // get new tags

                const tagArray = exclusiveTags.map(tag => tag.tagID)
                const tagDeleteQuery = `DELETE FROM tags WHERE tagID IN (?)`
                
                db.query (tagDeleteQuery, [tagArray], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error deleting tags' });
                    }

                    
                })
            })
        }
        
        // delete entry
        const query = 'DELETE FROM posts WHERE postID = ?';
        db.query(query, [idBuffer], (err) => {
            if (err) {
                console.error('Error deleting post:', err);
                return res.status(500).json({ error: 'Error deleting post' });
            }
        res.status(201).json({message: 'Entry deleted successfully'})
        }) 
    });
})

app.get('/get-current-month-entries', (req, res) => {
    const { userID, startDate, endDate} = req.query;
    const query = 'SELECT * FROM posts WHERE author = ? AND dateCreated >= ? AND dateCreated < ?';
    db.query(query, [toBinaryUUID(userID), startDate, endDate], (err, result) => {
        if (err) {
            console.error('Error fetching current month entries', err);
            res.status(500).json({ error: 'Error fetching current month entries' });
        } else {
            res.json(result);
        }
    });
});

app.get('/get-selected-date-entry', (req, res) => {
    const { userID, startDate, endDate} = req.query;
    const query = 'SELECT * FROM posts WHERE author = ? AND dateCreated >= ? AND dateCreated < ?';
    db.query(query, [toBinaryUUID(userID), startDate, endDate], (err, result) => {
        if (err) {
            console.error('Error fetching entry', err);
            res.status(500).json({ error: 'Error fetching entry' });
        } else {;
            if (result.length < 1) {
                return res.json(result);
            }
            
            const postNumberQuery = `SELECT postNumber FROM (
                                        SELECT postID, ROW_NUMBER() OVER (ORDER BY dateCreated ASC) AS postNumber FROM posts
                                    ) ranked
                                    WHERE postID = ?`

            db.query(postNumberQuery, [result[0].postID], (err, postNumber) => {
                if (err) {
                    console.error('Error getting post number', err);
                    res.status(500).json({error: 'Error getting post number'})
                }

                const tagSelectQuery = `SELECT tagName FROM post_tags JOIN tags ON post_tags.tagID = tags.tagID WHERE post_tags.postID = ?`

                db.query(tagSelectQuery, [result[0].postID], (err, tags) => {
                    if (err) {
                        console.error('Error getting tags', err);
                        res.status(500).json({error: 'Error getting tags'})
                    }
                    
                    result[0].content = decrypt(process.env.ALGORITHM.toString(), Buffer.from(process.env.ENCRYPT_SECRET, 'hex'), result[0].content)
                    
                    const updatedEntry = {
                        ...result[0],
                        postNumber: postNumber[0].postNumber,
                        tags: tags.map(tag => tag.tagName)
                    }

                    res.json(updatedEntry);
                })

            })
            
        }
    });
});