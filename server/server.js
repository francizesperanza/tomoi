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
const session = require('express-session');
const { encrypt, decrypt } = require('./helper');
const { fromBinaryUUID, toBinaryUUID, createBinaryUUID} = require("binary-uuid");
const seedPosts = require('./scripts/testing');
const dayjs = require('dayjs');
const { uploadthingHandler } = require('./uploadthing');

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
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
    port: process.env.DB_PORT
});

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
    const { title, author, content, contentText, feeling, dateCreated, lastEdited, tags} = req.body;
    const uuid = createBinaryUUID();
    const contentUuid = createBinaryUUID();
    // creating entry
    const query = 'INSERT INTO posts (postID, author, title, contentID, feeling, dateCreated, lastEdited, isFavorite) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [uuid.buffer, toBinaryUUID(author), title, contentUuid.buffer, feeling, dateCreated, lastEdited, false], (err, result) => {
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

/* app.get('/get-selected-date-entry', (req, res) => {
    const { userID, startDate, endDate} = req.query;
    const query = 'SELECT * FROM posts JOIN contents ON posts.contentID = contents.contentID WHERE posts.author = ? AND dateCreated >= ? AND dateCreated < ?';
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
}); */

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

// TESTING ENDPOINT

app.post('/seed-posts', seedPosts(db, createBinaryUUID, toBinaryUUID))