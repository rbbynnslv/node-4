function login(req, res) {
    const db = req.app.get('db');
    const { username, password } = req.body;

    db.users
        .findOne(
            {
                username,
            },
            {
                fields: ['id', 'username', 'email', 'password'],
            }
        )
        .then(user => {
            if (!user) {
                throw new Error('Invalid username');
            }

            // Here is where we check the hashed password from the database
            // with the password that was submitted by the user.
            return argon2.verify(user.password, password).then(valid => {
                if (!valid) {
                    throw new Error('Incorrect password');
                }

                const token = jwt.sign({ userId: user.id }, secret);
                delete user.password; // remove password hash from returned user object
                res.status(200).json({ ...user, token });
            });
        })
        .catch(err => {
            if (
                ['Invalid username', 'Incorrect password'].includes(err.message)
            ) {
                res.status(400).json({ error: err.message });
            } else {
                console.error(err);
                res.status(500).end();
            }
        });
}

module.exports = {
    login,
}