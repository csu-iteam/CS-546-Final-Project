const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const xss = require('xss');
const data = require('../data');
const user = data.users;
const plan = data.plans;
const log = data.logs;
const review = data.reviews;

let globaltitle;
let globalfeel;
let globalreviews;

router.get('/', async (req, res) => {
	if (req.session.username) {
		await res.redirect('/login/personal');
	}
	else {
		await res.render('form/login', { errorMessage: null });
	}
});

router.get('/logs', async (req, res) => {
		await res.render('layouts/log', {});
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
	const userInfo = await user.getByUsername(req.session.username);
	const userId = userInfo._id;
	const logtitle = info.logtitle;
	const logfeel = info.logfeel;
	const planId = info.id;
	let addition = {};
	const array = [];
	const plan_location = await plan.getById(planId);
//console.log(plan_location);
	for (let i of plan_location.nodes) {
		array.push(i.position);
	}
	addition.username = req.session.username;
	addition.plansLocation = array;
	const result = await log.insertLogs(userId, logtitle, planId, logfeel, '', "10/31/2020", 0, 0, addition);
	const result1 = {};
	result1.status = true;
	await res.json(result1);
});

router.post('/makereview', async (req, res) => {
	const info = req.body;
	const userInfo = await user.getByUsername(req.session.username);
	const userId = userInfo._id;
	const logReview = info.logReview;
	const logreviewId = info.id;
// 	let addition = {};
// 	const array = [];
// 	const plan_location = await plan.getById(planId);
// //console.log(plan_location);
// 	for (let i of plan_location.nodes) {
// 		array.push(i.position);
// 	}
// 	addition.username = req.session.username;
// 	addition.plansLocation = array;
	const result = await review.insertReviews(userId, logreviewId, "10/31/2020", logReview, []);
	const result1 = {};
	result1.status = true;
	await res.json(result1);
});

router.get('/database/plans', async (req, res) => {
	if (req.session.username) {
		const userData = await user.getByUsername(req.session.username);
		const data = await plan.getByUserId(userData._id);
		let temp = [];
		let count = false;
		for (let j of data) {
			for (let i of userData.plansId) {
				if (j._id === i) {
					count = true;
				}
			}
			if (count === false) {
				temp.push(j._id);
			}
			count = false;
		}
		const result = await user.updateUser(userData._id.toString(), { plansId: temp });
		await res.json(data);
	}
});

router.post('/database/plansdelete', async (req, res) => {
	const id = req.body.id;
	const userData = await plan.deleteById(id);
	await res.redirect('/login/personal/plans');
});

router.get('/database/logs', async (req, res) => {
	if (req.session.username) {
		const userData = await user.getByUsername(req.session.username);
		const data = await log.getByUserId(userData._id);
		await res.json(data);
	}
	//const userData = await log.getAllLogs();
	//await res.json(userData);
});

router.get('/database/reviews', async (req, res) => {
	if (req.session.username) {
		const data = await review.getAllReviews();
		for (let i of data) {
			const userData = await user.getById(i.userId);
			const name = userData.username;
			i.username = name;
		}
		await res.json(data);
	}
});

router.get('/database/mainlogs', async (req, res) => {
	const userData = await log.getAllLogs();
	//console.log(userData);
	await res.json(userData);
});

router.post('/database/logsUpdate', async (req, res) => {
	const id = req.body.logId;
	let change = {};
	const data = await log.getById(id);
	let temp = req.body.reading + data.reading;
	change = { reading: temp };
	const userData = await log.updateLog(id, change);
	globaltitle = data.title;
	globalfeel = data.feel;
	globalreviews = await review.getAllReviews();
	await res.json({});
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
	if (req.session.username) {
		await res.render('form/logs', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/plans', async(req, res) => {
	if (req.session.username) {
		await res.render('form/plans', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/comments', async(req, res) => {
	if (req.session.username) {
		await res.render('form/comments', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/account', async(req, res) => {
	if (req.session.username) {
		await res.render('form/account', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.get('/personal/replies', async(req, res) => {
	if (req.session.username) {
		await res.render('form/replies', {});
	}
	else {
		await res.redirect('/login');
	}
});

router.post('/personal', async (req, res) => {
	const info = req.body;
	const userData = await user.getByUsername(info.username);
	if (userData) {
		//const pass = userData.password;
		if (await bcrypt.compare(info.password, userData.password)) {
		//if (info.password === pass) {
			req.session.username = info.username;
			await res.render('form/personal', { username: userData.username, status: true });
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
	//const userData = await user.getByLastName(info.lastNames);
	//const userData1 = await user.getByFirstName(info.firstNames);
	const userData = await user.getByUsername(info.userNames);
	const userData1 = await user.getByEmail(info.userEmails);
	if ((userData) || (userData1)) {
	//if ((userData.username === info.userNames) || (userData1.email === info.userEmails)) {
		req.session.username = info.userNames;
		await res.render('form/personal', { username: info.userNames, status: true });
	}
	else {
		if (xss(info.passwords) !== xss(info.confirms)) {
			await res.render('form/register', { compare: "The re-type password does not match.", status1: true });
		}
		else {
			await bcrypt.genSalt(16, function(err, salt) {
				bcrypt.hash(info.passwords, salt, function(err, hash) {
					user.insertUsers(info.userNames, info.lastNames, info.firstNames, info.userEmails, hash, '', [], [], '');
				});
			});
			//user.insertUsers(info.lastNames, info.firstNames, hashPassword, null, null, null, null);
			await res.render('form/login', { registeredMessage: 'Your account has been registered.' });
		}
	}
});

router.get('/logout', async (req, res) => {
	await req.session.destroy();
	//await res.clearCookie('');
	await res.redirect('/login');
});

router.get('/personal/getlogs', async (req, res) => {
	await res.render('form/getlogs', { title: globaltitle, feel: globalfeel });
});

module.exports = router;