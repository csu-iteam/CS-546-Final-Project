const mongoConnection = require('../config/mongoConnection');
const data = require('../data');
const user = data.users;
const plan = data.plans;

const main = async () => {
	try {
		//await user.removeAll();
		//const data = await user.insertUsers("W", "X", "123456", "xw", [], []);
		const plan1_node = [{ position: "YellowstoneNationalParkHeadquarters", arrival_time: "10/31/2020 6:00", departure_time: "10/31/2020 18:00", recommended_restaurants: ["871982708es312sesde3414"], recommended_residence: ["321982708es312sesde3414"] }];
		const plan1 = await plan.insertPlans("871982708es312sesde3414", plan1_node);
		const plan2_node = [{ position: "New York", arrival_time: "10/26/2020 8:00", departure_time: "11/01/2020 17:00", recommended_restaurants: ["871982708es312sesde3426"], recommended_residence: ["321982708es312sesde3222"] }];
		const plan2 = await plan.insertPlans("871982708es312sesde3415", plan2_node);

		
	} catch (e) {
		console.log(e);
		const db = await mongoConnection();
		await db.serverConfig.close();
	}
	const db = await mongoConnection();
	await db.serverConfig.close();
};

main();