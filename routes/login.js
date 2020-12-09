const express = require('express');
const router = express.Router();
//const bcrypt = require('bcryptjs');
const data = require('../data/users');
const user = data.users;

router.get('/', async (req, res) => {
	//const result = await user.getByLastname('Wei');
	if (req.session.username) {
		//await res.render('form/login', { update: 'Log in success!' });
		await res.redirect('/login/personal');
	}
	else {
		await res.render('form/login', {});
	}
});

router.get('/personal', async (req, res) => {
	await res.render('form/personal', { username: req.session.username });
});

router.post('/personal', async (req, res) => {
	const info = req.body; 
	//const result = await user.insertUsers(info.username);
	const compare = await user.getByPassword(info.password);
	console.log(compare);
	if (compare !== null) {
		if (info.password === compare.password) {
			req.session.username = info.username;
			await res.render('form/personal', { username: info.username });
		}
	}
	else {
		await res.redirect('/login');
	}

});

module.exports = router;