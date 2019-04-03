const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = require('../users/users-model.js');
const { jwtSecret } = require('../config/secrets.js');

router.post('/register', (req, res) => {
	let user = req.body;
	const hash = bcrypt.hashSync(user.password, 10);
	user.password = hash;

	users
		.add(user)
		.then(saved => {
			res
				.status(201)
				.json(saved);
		})
		.catch(error => {
			res
				.status(500)
				.json(error);
		});
});

router.post('/login', (req, res) => {
	let { username, password } = req.body;

	users
		.findBy({ username })
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {
				const token = generateToken(user);
				res
					.status(200)
					.json({ 
						token, 
						message: `Welcome ${user.username}!` });
			}
			else {
				res
					.status(401)
					.json({ message: 'Invalid credentials' });
			}
		})
		.catch(error => {
			res
				.staus(500)
				.json(error);
		});
});

function generateToken(user) {
	const payload = {
		subject: user.id,
		username: user.username
	};

	const options = {
		expiresIn: '1d'
	};

	return jwt.sign(payload, jwtSecret, options);
};

module.exports = router;





