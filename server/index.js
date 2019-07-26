const express = require('express');
const massive = require('massive');
const jwt = require('jsonwebtoken');
const secret = require('../secret');

const users = require('./controllers/users.js');
const login = require('./controllers/login.js');

massive({
    host: 'localhost',
    port: 5432,
    database: 'node4db',
    user: 'postgres',
    password: 'node4db',
}).then(db => {
    const app = express();

    app.set('db', db);

    app.use(express.json());

    app.post('/api/register', users.register);
    app.get('/api/protected/data',
        function (req, res) {
            if (!req.headers.authorization) {
                return res.status(401).end();
            }

            try {
                const token = req.headers.authorization.split(' ')[1];
                jwt.verify(token, secret); // will throw an Error when token is invalid!!!
                res.status(200).json({ data: 'here is the protected data' });
            } catch (err) {
                console.error(err);
                res.status(401).end();
            }
        });
    app.post('/api/login', login.login);

    const port = 1800;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    })
})
    .catch(console.error);