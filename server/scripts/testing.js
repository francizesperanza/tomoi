module.exports = function seedPosts(db, createBinaryUUID, toBinaryUUID) {
    return (req, res) => {

        const baseAuthor = req.body.author;
        const feeling = req.body.feeling || 'neutral';
        const content = req.body.content || 'test content';
        const contentText = req.body.contentText || 'test content text';
        const tags = req.body.tags || [];

        const posts = [];
        const contents = [];
        const tagValues = [];

        for (let i = 1; i <= 100; i++) {
            const postUUID = createBinaryUUID();
            const contentUUID = createBinaryUUID();

            posts.push([
                postUUID.buffer,
                toBinaryUUID(baseAuthor),
                `Test Post ${i}`,
                contentUUID.buffer,
                feeling,
                new Date(),
                new Date(),
                false
            ]);

            contents.push([
                contentUUID.buffer,
                content,
                contentText
            ]);

            for (const tag of tags) {
                tagValues.push([createBinaryUUID().buffer, tag]);
            }
        }

        const postQuery = `
            INSERT INTO posts 
            (postID, author, title, contentID, feeling, dateCreated, lastEdited, isFavorite)
            VALUES ?
        `;

        db.query(postQuery, [posts], (err) => {
            if (err) return res.status(500).json({ error: err });

            const contentQuery = `
                INSERT INTO contents (contentID, content, contentText)
                VALUES ?
            `;

            db.query(contentQuery, [contents], (err) => {
                if (err) return res.status(500).json({ error: err });

                return res.status(201).json({ message: '100 test entries created' });
            });
        });
    };
};