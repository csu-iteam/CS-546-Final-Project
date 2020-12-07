const express = require('express');
const router = express.Router();
const data = require('../data');
const user = data.users;

router.get('/', async (req, res) => {
	const result = await user.getByLastname('Wei');
	res.render('form/login', { firstName: result });
});

module.exports = router;