const mongoConnection = require('../config/mongoConnection');
const data = require('../data');
const user = data.users;

const main = async () => {
	try {
		//await books.removeAll();
		//const data = await user.insertUsers("W", "X", "123456", "xw", [], []);
		const data1 = await user.getByPassword("123456");
		console.log(data1);

		
	} catch (e) {
		console.log(e);
		const db = await mongoConnection();
		await db.serverConfig.close();
	}
	const db = await mongoConnection();
	await db.serverConfig.close();
};

main();