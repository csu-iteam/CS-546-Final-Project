const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const xss = require('xss');
const data = require('../data');
const user = data.users;
const plan = data.plans;
const log = data.logs;

router.get('/', async (req, res) => {
	if (req.session.username) {
		await res.redirect('/login/personal');
	}
	else {
		await res.render('form/login', { errorMessage: null });
	}
});

router.get('/status', async (req, res) => {
	if (req.session.username) {
		const result = {};
		result.status = true;
		await res.json(result);
	}
	else {
		const result = {};
		result.status = false;
		await res.json(result);
	}
});

router.post('/makelog', async (req, res) => {
	const info = req.body;
	const userInfo = await user.getByLastName(req.session.username);
	const userId = userInfo._id;
	const logtitle = info.logtitle;
	const logfeel = info.logfeel;
	const planId = info.id;
	const result = await log.insertLogs(userId, logtitle, planId, logfeel, null, "10/31/2020", 0, 0);
	const result1 = {};
	result1.status = true;
	await res.json(result1);
});

router.get('/database/plans', async (req, res) => {
	const userData = await plan.getAllPlans();
	await res.json(userData);
});

router.post('/database/plansdelete', async (req, res) => {
	const id = req.body.id;
	const userData = await plan.deleteById(id);
	await res.redirect('/login/personal/plans');
});

router.get('/database/logs', async (req, res) => {
	const userData = await log.getAllLogs();
	await res.json(userData);
});

router.post('/database/logsUpdate', async (req, res) => {
	const id = req.body.logId;
	let change = {};
	const data = await log.getById(id);
	let temp = req.body.reading + data.reading;
	change = { reading: temp };
	const userData = await log.updateLog(id, change);
	await res.redirect('/login/personal/plans');
});

router.get('/personal', async (req, res) => {
	if (req.session.username) {
		await res.render('form/personal', { username: req.session.username });
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/register', async(req, res) => {
	await res.render('form/register', {});
});

router.get('/personal/logs', async(req, res) => {
	await res.render('form/logs', {});
});

router.get('/personal/plans', async(req, res) => {
	await res.render('form/plans', {});
});

router.get('/personal/comments', async(req, res) => {
	await res.render('form/comments', {});
});

router.get('/personal/account', async(req, res) => {
	await res.render('form/account', {});
});

router.get('/personal/replies', async(req, res) => {
	await res.render('form/replies', {});
});

router.post('/personal', async (req, res) => {
	const info = req.body;
	const userData = await user.getByLastName(info.username);
	if (userData) {
		const pass = userData.password;
		if (info.password === pass) {
			req.session.username = info.username;
			await res.render('form/personal', { username: userData.firstUserName, status: true });
		}
		else {
			await res.render('form/login', { errorMessage: 'The password is not correct.' });
		}
	}
	else {
		await res.render('form/login', { errorMessage: 'Your account does not exit. Please register first.' });
	}

});

router.post('/register', async (req, res) => {
	const info = req.body;
	const userData = await user.getByLastName(info.lastNames);
	const userData1 = await user.getByFirstName(info.firstNames);
	if ((userData) && (userData1)) {
		req.session.username = info.lastNames;
		await res.render('form/personal', { username: info.lastNames, status: true });
	}
	else {
		if (xss(info.passwords) !== xss(info.confirms)) {
			await res.render('form/register', { compare: "The re-type password does not match.", status1: true });
		}
		else {
			user.insertUsers(info.lastNames, info.firstNames, info.passwords, null, null, null, null);
			await res.render('form/login', { registeredMessage: 'Your account has been registered.' });
		}
	}
});

router.get('/logout', async (req, res) => {
	await req.session.destroy();
	//await res.clearCookie('');
	await res.redirect('/login');
});

module.exports = router;