const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({
    path: '../.env'
});

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const { encrypt, decrypt } = require('./helper');
const { fromBinaryUUID, toBinaryUUID, createBinaryUUID} = require("binary-uuid");
const seedPosts = require('./scripts/testing');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Manila');

const { uploadthingHandler } = require('./uploadthing');
const { UTApi } = require("uploadthing/server")
const { OAuth2Client } = require("google-auth-library")
const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    redirectUri: "postmessage"
});
const utapi = new UTApi();


const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(
  "/api/uploadthing", uploadthingHandler
);

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: "+08:00",
    dateStrings: true
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_APP_PASSWORD
    }
})


const sortQueryMap = {
    'newest': 'p.dateCreated DESC',
    'oldest': 'p.dateCreated ASC',
    'edited-newest': 'p.lastEdited DESC',
    'edited-oldest': 'p.lastEdited ASC',
    'feeling-a-z': 'p.feeling ASC',
    'feeling-z-a': 'p.feeling DESC',
    'title-a-z': 'p.title ASC',
    'title-z-a': 'p.title DESC',
}

const filterQueryMap = {
    'none': '',
    'date-this-year' : "AND YEAR(p.dateCreated) = YEAR(CURRENT_DATE)",
    'date-this-month' : "AND YEAR(p.dateCreated) = YEAR(CURRENT_DATE) AND MONTH(p.dateCreated) = MONTH(CURRENT_DATE)",
    "date-last-year": "AND YEAR(p.dateCreated) = YEAR(CURRENT_DATE) - 1", 
    "date-last-month": `AND p.dateCreated >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH), '%Y-%m-01')
                        AND p.dateCreated < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')`,
    'feeling-happy': "AND p.feeling = 'Happy'",
    'feeling-sad' : "AND p.feeling = 'Sad'",
    'feeling-angry' : "AND p.feeling = 'Angry'",
    'feeling-excited' : "AND p.feeling = 'Excited'",
    'feeling-anxious' : "AND p.feeling = 'Anxious'",
    'feeling-neutral' : "AND p.feeling = 'Neutral'",
    'feeling-reflective' : "AND p.feeling = 'Reflective'",
    'feeling-peaceful' : "AND p.feeling = 'Peaceful'",
    'feeling-lovestruck' : "AND p.feeling = 'Lovestruck'"
}

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
    const query = 'INSERT INTO users (userID, username, email, password, loginType) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [uuid.buffer, username, email, hashedPassword, 'local'], (err, result) => {
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

app.put('/signup-link', (req, res) => {
    const pendingUser = req.session.pendingGoogleUser
    const query = 'UPDATE users SET loginType = ?, googleID = ? WHERE email = ?';
    db.query(query, ['google', pendingUser.googleId, pendingUser.email], (err, result) => {
        if (err) {
            console.error('Error linking user:', err);
            res.status(500).json({ error: 'Error linking user' });
        } else {
            const selectQuery = 'SELECT * FROM users WHERE email = ?';
            db.query(selectQuery, [pendingUser.email], (err, selRes) => {
                if (err) {
                    console.error('Error finding user:', err);
                    res.status(500).json({ error: 'Error finding user' });
                } else {
                    req.session.pendingGoogleUser = null
                    req.session.user = req.session.user = { userID: fromBinaryUUID(selRes[0].userID), username: selRes[0].username, email: selRes[0].email, profilePic: selRes[0].profilePic };
                    res.status(201).json({ user: req.session.user, message: 'User linked successfully' });
                }
            })
        }
    });
});

app.post('/google-signup-user', (req, res) => {
    const { username} = req.body;
    const pendingUser = req.session.pendingGoogleUser
    const uuid = createBinaryUUID();
    const query = 'INSERT INTO users (userID, username, email, loginType, googleID, profilePic) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [uuid.buffer, username, pendingUser.email, 'google', pendingUser.googleId, pendingUser.picture], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            console.error('Error inserting user:', err);
            res.status(500).json({ error: 'Error inserting user' });
        } else {
            req.session.user = { userID: uuid, username: username, email: pendingUser.email, profilePic: pendingUser.picture };
            res.status(201).json({user: req.session.user,  message: 'User created successfully' });
        }
        req.session.pendingGoogleUser = null
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
                        req.session.user = { userID: fromBinaryUUID(result[0].userID), username: result[0].username, email: result[0].email, profilePic: result[0].profilePic };
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

app.post('/auth/google', async (req, res) => {
    const { code } = req.body;

    try {
        const { tokens } = await client.getToken(code)
        
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()

        req.session.pendingGoogleUser = {
            email: payload.email,
            googleId: payload.sub,
            picture: payload.picture,
            name: payload.name,
        };

        checkExistenceQuery = "SELECT * FROM users WHERE email = ?"
        db.query(checkExistenceQuery, [payload.email], (err, ceRes) => {
            if (err)
                return res.status(500).json({ error: 'Error logging in' });
            else {
                console.log(ceRes)
                if (ceRes.length == 0)
                    return res.json({ status: 'no-acc' });
                if (ceRes[0].loginType == 'local')
                    return res.json({ status: 'local' });
                if (ceRes[0].loginType == 'google') {
                    req.session.pendingGoogleUser = null
                    req.session.user = { userID: fromBinaryUUID(ceRes[0].userID), username: ceRes[0].username, email: ceRes[0].email, profilePic: ceRes[0].profilePic };
                    return res.json({ user: req.session.user, status: 'google' });
                }
            }
        })

    } catch (err) {
        console.error(err.response?.data || err);
    }
    
});

app.post('/forgot-password', async (req, res) => {
    const { userEmail } = req.body;

    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';

    db.query(query, [userEmail, userEmail], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error checking user' });
        } else {
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            if (result.length < 1) {
                return res.status(200).json({ message: 'Reset request saved!' });
            } else {
                const code = Math.random().toString(36).slice(2, 8);
                

                saveReqQuery = `INSERT INTO password_resets (email, code, expiresAt) VALUES (?, ?, ?)
                                ON DUPLICATE KEY UPDATE code = VALUES(code), expiresAt = VALUES(expiresAt), attempts = 0;`
                db.query(saveReqQuery, [result[0].email, code, expiresAt], (err, iRes) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ error: 'Error saving reset request' });
                    }

                    transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: result[0].email,
                        subject: "Reset Password Confirmation Code",
                        text: 
                        `
                            Hi ${result[0].username}!

                            Here is the confirmation code needed for your password reset:

                            ${code}

                            This confirmation code expires in 15 minutes.
                        `
                    })

                    return res.status(200).json({ message: 'Reset request saved!' });
                })
            }
        }
    });
    
});

app.post('/verify-confirmation-code', async (req, res) => {
    const { confirmationCode, userEmail } = req.body;

    // Find user
    const query = `
        SELECT email FROM users WHERE username = ? OR email = ?;
    `;

    db.query(query, [userEmail, userEmail], (err, findResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error validating code ' });
        }
        
        if (findResult.length < 1) {
            return res.status(400).json({ message: 'Error validating code '})
        }

        const email = findResult[0].email

        const psQuery = `
            SELECT * FROM password_resets WHERE email = ?
        `

        db.query(psQuery, [email], (err, psResults) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error validating code ' });
            }

            if (psResults.length < 1) {
                return res.status(400).json({ message: 'No password reset request found' });
            }

            const reset = psResults[0]
            if (reset.lockedUntil && dayjs.utc(reset.lockedUntil)
                .tz("Asia/Manila").isAfter(dayjs().utc()
                .tz("Asia/Manila"))) {
                return res.status(423).json({ message: 'Too many attempts. Try again later.'})
            }
            
            if (reset.code != confirmationCode) {
                
                const attemptQuery = `
                    UPDATE password_resets 
                    SET 
                    attempts = 
                    CASE
                        WHEN attempts + 1 >= 5 THEN 0
                        ELSE attempts + 1
                    END,
                    lockedUntil = 
                    CASE
                        WHEN attempts + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                        ELSE lockedUntil
                    END
                    WHERE email = ?;
                `;

                db.query(attemptQuery, [email], (err, result) => {
                    if (err) {
                        console.log(err.message)
                        return res.status(500).json({ error: 'Error validating code' });
                    }
                    return res.status(400).json({ message: 'Confirmation code is wrong' });
                })
                
            } else {
                const resetQuery = `
                    UPDATE password_resets
                    SET attempts = 0,
                        lockedUntil = NULL
                    WHERE email = ?;
                `;

                db.query(resetQuery, [email], (err) => {
                    if (err) {
                        console.log(err.message)
                        return res.status(500).json({ error: 'Error resetting attempts' });
                    }
                    return res.status(200).json({ message: 'Confirmation code verified!' });
                });
            }
        })
    });
});

app.get('/logout-user', (req, res) => {
    req.session.user = null
    res.status(200).json({message: 'Logout successful'})
})

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

app.put('/change-account-details', (req, res) => {
    const { userID, newUsername, newPassword, password} = req.body;

    if (!usernameRegex.test(newUsername) && newUsername.length != 0 ||
        !passwordRegex.test(newPassword) && newPassword.length != 0) {
        res.status(400).json({ error: 'Invalid username or password format' });
        return;
    }

    const values = []
    var hashedPassword

    if (newPassword.length != 0)
        hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    const chooseQuery = () => {
        var query

        if (newPassword.length == 0 ){
            values.push(newUsername)
            query = 'username = ?'
        } else if (newUsername.length == 0){
            values.push(hashedPassword)
            query = 'password = ?'
        } else {
            values.push(newUsername, hashedPassword)
            query = 'username = ?, password = ?'
        }

        values.push(toBinaryUUID(userID))
        
        return query
    }

    const query = 'SELECT * FROM users WHERE userID = ?';
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error changing account details' });
        } else {
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (err, isMatch) => {
                    if (err) {
                        res.status(500).json({ error: 'Error changing account details' });
                    } else if (isMatch) {
                        const queryOption = chooseQuery()
                        
                        const changeDetailsQuery = `UPDATE users SET ${queryOption} WHERE userID = ?`;
                        db.query(changeDetailsQuery, values, (err, changeRes) => {
                            if (err) {
                                console.error('Error changing account details:', err);
                                res.status(500).json({ error: 'Error changing account details' });
                            } else {
                                req.session.user = { userID: fromBinaryUUID(result[0].userID), username: newUsername.length == 0 ? result[0].username : newUsername, email: result[0].email, profilePic: result[0].profilePic };
                                res.status(200).json({ message: 'Account details change successful!'});
                            }
                        })
                    } else {
                        res.status(401).json({ error: 'Invalid password' });
                    }
                });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        }
    });
});

app.put('/change-profile-picture', (req, res) => {
    const { userID, currentProfilePic, profilePic} = req.body;
    
    // Delete previous picture
    if (currentProfilePic) {
        console.log(currentProfilePic)
        const key = currentProfilePic.split("/f/")[1];

        utapi.deleteFiles([
            key
        ]);
    }

    const query = "UPDATE users SET profilePic = ? WHERE userID = ?";
    db.query(query, [profilePic, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error changing account details' });
        } else {
            req.session.user = ({...req.session.user, profilePic: profilePic })
            res.status(200).json({ message: 'Changing profile picture successful!'});
        }
    });
});

app.put('/delete-profile-picture', (req, res) => {
    const { userID, currentProfilePic} = req.body;

    console.log(currentProfilePic)
    const key = currentProfilePic.split("/f/")[1];

    utapi.deleteFiles([
        key
    ]);

    const query = "UPDATE users SET profilePic = NULL WHERE userID = ?";
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error deleting account details' });
        } else {
            req.session.user = ({...req.session.user, profilePic: null })
            res.status(200).json({ message: 'Deleting profile picture successful!'});
        }
    });
});

// AUTHENTICATION

app.get('/session-check', (req, res) => {
    if (!req.session.user)
        return res.status(401).json({error: "User is not logged in."});
    return res.json(req.session.user);
})

app.get('/google-session-check', (req, res) => {
    if (!req.session.pendingGoogleUser)
        return res.status(401).json({error: "No pending google logins."});
    const pendingUser = req.session.pendingGoogleUser
    return res.json({name: pendingUser.name, picture: pendingUser.picture});
})


// SEARCH

app.get('/search', (req, res) => {
    const { userID, searchQuery, cursorPostNumber, cursorLikeness} = req.query;
    var query;
    if (cursorPostNumber === undefined) {
        query = `SELECT
                            p.*,
                            c.*,
                            ranked.postNumber,
                            CASE
                                WHEN COUNT(t.tagName) = 0 THEN JSON_ARRAY()
                                ELSE JSON_ARRAYAGG(t.tagName)
                            END AS tags,
                            (
                                CASE
                                    WHEN p.title = ? THEN 100
                                    WHEN p.title LIKE CONCAT(?, '%') THEN 75
                                    WHEN p.title LIKE CONCAT('%', ?, '%') THEN 50
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN c.content LIKE CONCAT('%', ?, '%') THEN 10
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN p.feeling LIKE CONCAT('%', ?, '%') THEN 40
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN COUNT(CASE WHEN t.tagName LIKE CONCAT('%', ?, '%') THEN 1 END) > 0
                                    THEN 30
                                    ELSE 0
                                END
                            ) AS likeness
                            
                        FROM posts p

                        JOIN contents c
                            ON p.contentID = c.contentID

                        JOIN (
                            SELECT
                                postID,
                                ROW_NUMBER() OVER (ORDER BY dateCreated ASC) AS postNumber
                            FROM posts
                        ) ranked
                            ON ranked.postID = p.postID

                        LEFT JOIN post_tags pt
                            ON pt.postID = p.postID

                        LEFT JOIN tags t
                            ON t.tagID = pt.tagID

                        WHERE p.author = ?
                        

                        GROUP BY
                            p.postID,
                            ranked.postNumber
                        HAVING likeness > 0
                        ORDER BY likeness DESC, ranked.postNumber ASC
                        LIMIT 5;`
        db.query(query, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, toBinaryUUID(userID)], (err, result) => {
            if (err) {
                console.error('Error searching for entries', err);
                res.status(500).json({ error: 'Error searching for entries' });
            } else {
                res.json({result: result, cursor: result.length === 5 ? {postNumber: result[result.length - 1].postNumber, likeness: result[result.length - 1].likeness} : null});
            }
        });
    } else {
        query = `SELECT
                            p.*,
                            c.*,
                            ranked.postNumber,
                            CASE
                                WHEN COUNT(t.tagName) = 0 THEN JSON_ARRAY()
                                ELSE JSON_ARRAYAGG(t.tagName)
                            END AS tags,
                            (
                                CASE
                                    WHEN p.title = ? THEN 100
                                    WHEN p.title LIKE CONCAT(?, '%') THEN 75
                                    WHEN p.title LIKE CONCAT('%', ?, '%') THEN 50
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN c.content LIKE CONCAT('%', ?, '%') THEN 10
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN p.feeling LIKE CONCAT('%', ?, '%') THEN 40
                                    ELSE 0
                                END
                                +
                                CASE
                                    WHEN COUNT(CASE WHEN t.tagName LIKE CONCAT('%', ?, '%') THEN 1 END) > 0
                                    THEN 30
                                    ELSE 0
                                END
                            ) AS likeness
                            
                        FROM posts p

                        JOIN contents c
                            ON p.contentID = c.contentID

                        JOIN (
                            SELECT
                                postID,
                                ROW_NUMBER() OVER (ORDER BY dateCreated ASC) AS postNumber
                            FROM posts
                        ) ranked
                            ON ranked.postID = p.postID

                        LEFT JOIN post_tags pt
                            ON pt.postID = p.postID

                        LEFT JOIN tags t
                            ON t.tagID = pt.tagID

                        WHERE
                        p.author = ? AND ranked.postNumber > ?

                        GROUP BY
                            p.postID,
                            ranked.postNumber
                        HAVING likeness > 0
                        ORDER BY likeness DESC, ranked.postNumber ASC
                        LIMIT 5;`

        db.query(query, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, toBinaryUUID(userID), cursorPostNumber], (err, result) => {
            if (err) {
                console.error('Error searching for entries', err);
                res.status(500).json({ error: 'Error searching for entries' });
            } else {
                res.json({result: result, cursor: result.length === 5 ? {postNumber: result[result.length - 1].postNumber, likeness: result[result.length - 1].likeness} : null});
            }
        });
    }
    
});

// ENTRY ENDPOINTS

app.post('/create-entry', (req, res) => {
    const { title, author, content, contentText, feeling, dateCreated, lastEdited, tags, writtenOnTime} = req.body;
    const uuid = createBinaryUUID();
    const contentUuid = createBinaryUUID();
    // creating entry
    const query = 'INSERT INTO posts (postID, author, title, contentID, feeling, dateCreated, lastEdited, isFavorite, writtenOnTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [uuid.buffer, toBinaryUUID(author), title, contentUuid.buffer, feeling, dateCreated, lastEdited, false, writtenOnTime], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Post already exists' });
            }
            console.error('Error inserting post:', err);
            res.status(500).json({ error: 'Error inserting post' });
        }

        const contentQuery = 'INSERT INTO contents (contentID, content, contentText) VALUES (?, ?, ?)';
        db.query(contentQuery, [contentUuid.buffer, content, contentText], (err, contentRes) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Content already exists' });
                }
                console.error('Error creating content:', err);
                res.status(500).json({ error: 'Error creating content' });
            }
            
            if (tags.length == 0) {
                return res.status(201).json({message: 'Entry created successfully'})
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

        })

    });
    
})

app.put('/edit-entry', (req, res) => {
    const { postID, title, contentID, content, contentText, feeling, lastEdited, tags} = req.body;
    const idBuffer = Buffer.from(postID.data);
    const contentIdBuffer = Buffer.from(contentID.data);

    // editing entry
    const query = 'UPDATE posts SET title = ?, feeling = ?, lastEdited = ? WHERE postID = ?';
    db.query(query, [title, feeling, lastEdited, idBuffer], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ error: 'Error updating post' });
        }

        const contentQuery = 'UPDATE contents SET content = ?, contentText = ? WHERE contentID = ?';
        db.query(contentQuery, [content, contentText, contentIdBuffer], (err, contentRes) => {
            if (err) {
                console.error('Error updating content:', err);
                return res.status(500).json({ error: 'Error updating content' });
            }

            if (tags.length == 0) {
                return res.status(201).json({message: 'Entry edited successfully'})
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
        })
        
    });
})

app.put('/update-best-streak', (req, res) => {
    const {userID, bestStreak} = req.body;

    // editing entry
    const query = 'UPDATE users SET bestStreak = ? WHERE userID = ?';
    db.query(query, [bestStreak, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error updating best streak:', err);
            return res.status(500).json({ error: 'Error updating best streak' });
        }
    });
})

app.delete('/delete-entry', (req, res) => {
    const { postID, contentID, tags} = req.body;
    const idBuffer = Buffer.from(postID.data);
    const contentIdBuffer = Buffer.from(contentID.data);

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
    const query = `SELECT
                        p.*,
                        c.*,
                        ranked.postNumber,
                        CASE
                            WHEN COUNT(t.tagName) = 0 THEN JSON_ARRAY()
                            ELSE JSON_ARRAYAGG(t.tagName)
                        END AS tags
                    FROM posts p

                    JOIN contents c
                        ON p.contentID = c.contentID

                    JOIN (
                        SELECT
                            postID,
                            ROW_NUMBER() OVER (ORDER BY dateCreated ASC) AS postNumber
                        FROM posts
                    ) ranked
                        ON ranked.postID = p.postID

                    LEFT JOIN post_tags pt
                        ON pt.postID = p.postID

                    LEFT JOIN tags t
                        ON t.tagID = pt.tagID

                    WHERE p.author = ?
                    AND p.dateCreated >= ?
                    AND p.dateCreated < ?

                    GROUP BY
                        p.postID,
                        ranked.postNumber;`
    //const query = 'SELECT * FROM posts JOIN contents ON posts.contentID = contents.contentID WHERE author = ? AND dateCreated >= ? AND dateCreated < ?';
    db.query(query, [toBinaryUUID(userID), startDate, endDate], (err, result) => {
        if (err) {
            console.error('Error fetching current month entries', err);
            res.status(500).json({ error: 'Error fetching current month entries' });
        } else {
            res.json(result);
        }
    });
});

app.get('/get-all-entries', (req, res) => {
    const {userID, currentPage, entriesPerPage, sortOption, filterOption} = req.query;

    const limit = Number(entriesPerPage);
    const offset = (Number(currentPage) - 1) * limit;

    const query = `SELECT
                        p.*,
                        c.*,
                        ROW_NUMBER() OVER (ORDER BY p.dateCreated ASC) AS postNumber,
                        COUNT(*) OVER() AS total,
                        COALESCE(JSON_ARRAYAGG(t.tagName), JSON_ARRAY()) AS tags
                    FROM posts p

                    JOIN contents c
                        ON p.contentID = c.contentID

                    LEFT JOIN post_tags pt
                        ON pt.postID = p.postID

                    LEFT JOIN tags t
                        ON t.tagID = pt.tagID

                    WHERE p.author = ?
                    ${filterQueryMap[filterOption] ?? ''}

                    GROUP BY
                        p.postID,
                        c.contentID

                    ORDER BY ${sortQueryMap[sortOption] ?? 'p.lastEdited DESC'}

                    LIMIT ?
                    OFFSET ?;`

    //const query = 'SELECT * FROM posts JOIN contents ON posts.contentID = contents.contentID WHERE author = ? AND dateCreated >= ? AND dateCreated < ?';
    db.query(query, [toBinaryUUID(userID), limit, offset], (err, result) => {
        if (err) {
            console.error('Error fetching all entries', err);
            res.status(500).json({ error: 'Error fetching all entries' });
        } else {
            console.log(result)
            res.json(result);
        }
    });
});

app.get('/get-latest-entry', (req, res) => {
    const {userID} = req.query;

    const query = `SELECT
                        p.*,
                        c.*,
                        ROW_NUMBER() OVER (ORDER BY p.dateCreated ASC) AS postNumber,
                        COUNT(*) OVER() AS total,
                        COALESCE(JSON_ARRAYAGG(t.tagName), JSON_ARRAY()) AS tags
                    FROM posts p

                    JOIN contents c
                        ON p.contentID = c.contentID

                    LEFT JOIN post_tags pt
                        ON pt.postID = p.postID

                    LEFT JOIN tags t
                        ON t.tagID = pt.tagID

                    WHERE p.author = ?

                    GROUP BY
                        p.postID,
                        c.contentID

                    ORDER BY p.dateCreated DESC;`

    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching latest entry', err);
            res.status(500).json({ error: 'Error fetching latest entry' });
        } else {
            res.json(result[0]);
        }
    });
});

app.get('/get-last-edited-entry', (req, res) => {
    const {userID} = req.query;
    const query = `SELECT
                        p.*,
                        c.*,
                        ROW_NUMBER() OVER (ORDER BY p.dateCreated ASC) AS postNumber,
                        COUNT(*) OVER() AS total,
                        COALESCE(JSON_ARRAYAGG(t.tagName), JSON_ARRAY()) AS tags
                    FROM posts p

                    JOIN contents c
                        ON p.contentID = c.contentID

                    LEFT JOIN post_tags pt
                        ON pt.postID = p.postID

                    LEFT JOIN tags t
                        ON t.tagID = pt.tagID

                    WHERE p.author = ?

                    GROUP BY
                        p.postID,
                        c.contentID

                    ORDER BY p.lastEdited DESC;`

    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching latest entry', err);
            res.status(500).json({ error: 'Error fetching latest entry' });
        } else {
            res.json(result[0]);
        }
    });
});

app.get('/get-favorite-entries', (req, res) => {
    const {userID, currentPage, entriesPerPage} = req.query;

    const limit = Number(entriesPerPage);
    const offset = (Number(currentPage) - 1) * limit;
    
    const query = `SELECT
                        p.*,
                        c.*,
                        ranked.postNumber,
                        COUNT(*) OVER() AS total,
                        CASE
                            WHEN COUNT(t.tagName) = 0 THEN JSON_ARRAY()
                            ELSE JSON_ARRAYAGG(t.tagName)
                        END AS tags
                    FROM posts p

                    JOIN contents c
                        ON p.contentID = c.contentID

                    JOIN (
                        SELECT
                            postID,
                            ROW_NUMBER() OVER (ORDER BY dateCreated ASC) AS postNumber
                        FROM posts
                    ) ranked
                        ON ranked.postID = p.postID

                    LEFT JOIN post_tags pt
                        ON pt.postID = p.postID

                    LEFT JOIN tags t
                        ON t.tagID = pt.tagID

                    WHERE p.author = ? AND p.isFavorite = 1

                    GROUP BY
                        p.postID,
                        ranked.postNumber
                        
                    ORDER BY ranked.postNumber ASC
                    
                    LIMIT ?
                    
                    OFFSET ?;`
    //const query = 'SELECT * FROM posts JOIN contents ON posts.contentID = contents.contentID WHERE author = ? AND dateCreated >= ? AND dateCreated < ?';
    db.query(query, [toBinaryUUID(userID), limit, offset], (err, result) => {
        if (err) {
            console.error('Error fetching all favorite entries', err);
            res.status(500).json({ error: 'Error fetching all entries' });
        } else {
            res.json(result);
        }
    });
});

app.put('/update-favorite', (req, res) => {
    const {postID, favorite} = req.body;

    const idBuffer = Buffer.from(postID.data);
    const query = 'UPDATE posts SET isFavorite = ? WHERE postID = ?';
    db.query(query, [favorite, idBuffer], (err, result) => {
        if (err) {
            console.error('Error updating favorite', err);
            res.status(500).json({ error: 'Error updating favorite' });
        }

        res.status(200).json(result);
    });
});

// STATS API

app.get('/get-total-entry-count', (req, res) => {
    const { userID } = req.query;
    const query = `SELECT COUNT(p.postID) as total FROM posts p WHERE p.author = ?;`
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching total entry count', err);
            res.status(500).json({ error: 'Error fetching total entry count' });
        } else {
            res.json(result[0].total);
        }
    });
});

app.get('/get-journaling-duration', (req, res) => {
    const { userDate, userID } = req.query;
    const query = `SELECT DATEDIFF(DATE_FORMAT(?, '%Y-%m-%d'), DATE_FORMAT(MIN(dateCreated), '%Y-%m-%d')) + 1 AS duration_days FROM posts WHERE author = ?;`
    db.query(query, [userDate, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching journaling duration', err);
            res.status(500).json({ error: 'Error fetching journaling duration' });
        } else {
            res.json(result[0].duration_days);
        }
    });
});

app.get('/get-word-stats', (req, res) => {
    const { userID } = req.query;
    const query = `WITH word_counts AS (
                    SELECT
                        c.contentID AS contentID,
                        CASE
                            WHEN TRIM(REGEXP_REPLACE(c.contentText, '[[:space:]]+', ' ')) = ''
                            THEN 0
                            ELSE
                                LENGTH(TRIM(REGEXP_REPLACE(c.contentText, '[[:space:]]+', ' ')))
                                - LENGTH(REPLACE(TRIM(REGEXP_REPLACE(c.contentText, '[[:space:]]+', ' ')), ' ', ''))
                                + 1
                        END AS word_count
                        FROM contents c
                        JOIN posts p ON c.contentID = p.contentID
                        WHERE p.author = ?
                    ),
                    stats AS (
                        SELECT 
                            SUM(word_count) AS total_words,
                            AVG(word_count) AS avg_words,
                            MAX(word_count) AS longest_entry
                        FROM word_counts
                    )
                    SELECT 
                        s.total_words,
                        s.avg_words,
                        s.longest_entry,
                        po.*
                    FROM stats s
                    JOIN word_counts wc ON wc.word_count = s.longest_entry
                    JOIN posts po ON wc.contentID = po.contentID
                    ORDER BY po.contentID DESC
                    LIMIT 1;`
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching word stats', err);
            res.status(500).json({ error: 'Error fetching word stats' });
        } else {
            res.json(result[0]);
        }
    });
});

app.get('/get-streak-stats', (req, res) => {
    const { userDate, userID } = req.query;
    const query = `
    
    WITH postDates AS (
        SELECT DISTINCT DATE(dateCreated) AS post_date
        FROM posts
        WHERE author = ? AND writtenOnTime = 1
    ),
    dateGroups AS (
        SELECT
            post_date,
            post_date - INTERVAL ROW_NUMBER() OVER (ORDER BY post_date) DAY AS island_id
            FROM postDates
    ),
    streaks AS (
        SELECT
            island_id,
            COUNT(*) AS streak_length,
            MAX(post_date) AS last_post_date
        FROM dateGroups
        GROUP BY island_id
    ),
    currentStreakCalc AS (
        SELECT
            CASE
                WHEN MAX(last_post_date) >= DATE(?) - INTERVAL 1 DAY
                THEN (SELECT streak_length FROM streaks ORDER BY last_post_date DESC LIMIT 1)
                ELSE 0
            END AS current_streak
        FROM streaks
    )
    
    SELECT
        u.bestStreak,
        COALESCE(c.current_streak, 0) AS currentStreak
    FROM users u
    LEFT JOIN currentStreakCalc c ON 1=1
    WHERE u.userID = ?;`
    
    db.query(query, [toBinaryUUID(userID), userDate, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching streak stats', err);
            res.status(500).json({ error: 'Error fetching streak stats' });
        } else {
            res.json(result[0]);
        }
    });
});

app.get('/get-entry-chart-data', (req, res) => {
    const { userDate, userID } = req.query;
    const query = `
    
    WITH RECURSIVE months AS (
        SELECT DATE_FORMAT(?, '%Y-%m-01') AS month_start
        UNION ALL
        SELECT DATE_SUB(month_start, INTERVAL 1 MONTH)
        FROM months
        WHERE month_start > DATE_FORMAT(DATE_SUB(?, INTERVAL 5 MONTH), '%Y-%m-01')
    )

    SELECT
        DATE_FORMAT(m.month_start, '%b %Y') AS month,

        COUNT(CASE WHEN p.feeling = 'Angry' THEN 1 END) AS angry,
        COUNT(CASE WHEN p.feeling = 'Excited' THEN 1 END) AS excited,
        COUNT(CASE WHEN p.feeling = 'Happy' THEN 1 END) AS happy,
        COUNT(CASE WHEN p.feeling = 'Peaceful' THEN 1 END) AS peaceful,
        COUNT(CASE WHEN p.feeling = 'Reflective' THEN 1 END) AS reflective,
        COUNT(CASE WHEN p.feeling = 'Sad' THEN 1 END) AS sad,
        COUNT(CASE WHEN p.feeling = 'Anxious' THEN 1 END) AS anxious,
        COUNT(CASE WHEN p.feeling = 'Lovestruck' THEN 1 END) AS lovestruck,
        COUNT(CASE WHEN p.feeling = 'Neutral' THEN 1 END) AS neutral

    FROM months m
    LEFT JOIN posts p
        ON DATE_FORMAT(p.dateCreated, '%Y-%m') =
        DATE_FORMAT(m.month_start, '%Y-%m')
    AND author = ?

    GROUP BY m.month_start
    ORDER BY m.month_start ASC;`
    
    db.query(query, [userDate, userDate, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching entry chart data', err);
            res.status(500).json({ error: 'Error fetching entry chart data' });
        } else {
            res.json(result);
        }
    });
});

app.get('/get-feeling-chart-data', (req, res) => {
    const { userID } = req.query;
    const query = `
        SELECT
            f.feeling,
            COUNT(p.feeling) AS count
        FROM feelings f
        LEFT JOIN posts p
            ON p.feeling = f.feeling
        AND p.author = ?
        GROUP BY f.feeling;
    `
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching feeling chart data', err);
            res.status(500).json({ error: 'Error fetching feeling chart data' });
        } else {
            res.json(result);
        }
    });
});

app.get('/get-feeling-month-data', (req, res) => {
    const { userDate, userID } = req.query;
    const query = `
    
    WITH RECURSIVE
    min_month AS (
        SELECT DATE_FORMAT(MIN(dateCreated), '%Y-%m-01') AS first_month
        FROM posts
        WHERE author = ?
    ),
    months AS (
        SELECT DATE_FORMAT(?, '%Y-%m-01') AS month_start

        UNION ALL

        SELECT DATE_SUB(month_start, INTERVAL 1 MONTH)
        FROM months
        CROSS JOIN min_month
        WHERE month_start > first_month
    )

    SELECT
        DATE_FORMAT(m.month_start, '%M %Y') AS month,

        COUNT(CASE WHEN 
            p.feeling = 'Happy' OR 
            p.feeling = 'Excited' OR
            p.feeling = 'Peaceful' OR
            p.feeling = 'Reflective' OR
            p.feeling = 'Lovestruck' THEN 1 END) AS happy_count,
        COUNT(CASE WHEN 
            p.feeling = 'Sad' OR
            p.feeling = 'Anxious' OR
            p.feeling = 'Angry' THEN 1 END) AS sad_count

    FROM months m
    LEFT JOIN posts p
        ON DATE_FORMAT(p.dateCreated, '%Y-%m') =
        DATE_FORMAT(m.month_start, '%Y-%m')
    AND author = ?

    GROUP BY m.month_start
    ORDER BY m.month_start ASC;`
    
    db.query(query, [toBinaryUUID(userID), userDate, toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching feeling month data', err);
            res.status(500).json({ error: 'Error fetching feeling month data' });
        } else {
            res.json(result);
        }
    });
});

app.get('/get-top-10-tags', (req, res) => {
    const { userID } = req.query;
    const query = `
    
    SELECT t.tagName, COUNT(pt.postID) AS use_count FROM post_tags pt
    JOIN tags t ON pt.tagID = t.tagID
    JOIN posts p ON p.postID = pt.postID
    AND p.author = ?
    GROUP BY t.tagName
    ORDER BY use_count DESC
    LIMIT 10;`
    
    db.query(query, [toBinaryUUID(userID)], (err, result) => {
        if (err) {
            console.error('Error fetching top tags', err);
            res.status(500).json({ error: 'Error fetching top tags' });
        } else {
            res.json(result);
        }
    });
});

// TESTING ENDPOINT

app.post('/seed-posts', seedPosts(db, createBinaryUUID, toBinaryUUID))