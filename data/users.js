const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
let { ObjectId } = require('mongodb');

async function insertUsers(lastUserName, firstUserName, password, nickName, plansId, logsId, accImage) {
    const user = await users();
    const newInsert = {
        lastUserName: lastUserName,
        firstUserName: firstUserName,
        password: password,
        nickName: nickName,
        plansId: plansId,
        logsId: logsId,
        accountImage: accImage
    };
    const result = await user.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function updateUser(id, updated) {
	if (!id) throw 'The id has not provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	if (!updated) throw 'The update information has not been provided.';
	const data = ObjectId(id);
	const user = await users();
	const obj = {};
	if (updated.lastUserName)
		obj.lastUserName = updatedlastUserName;
	if (updated.firstUserName)
        obj.firstUserName = updated.firstUserName;
    if (updated.password)
        obj.password = updated.password;
    if (updated.nickName)
        obj.nickName = updated.nickName;
	if ((updated.plansId) && (updated.plansId.length !== 0)) {
		for (let i of updated.plansId) {
			const result2 = await user.updateOne({ _id: data }, { $push: { plansId: { $each: [i] } } });
		}
	}
	if ((updated.logsId) && (updated.logsId.length !== 0)) {
		for (let i of updated.logsId) {
			const result3 = await user.updateOne({ _id: data }, { $push: { logsId: { $each: [i] } } });
		}
	}
	const result = await user.updateOne({ _id: data }, { $set: obj });
	const result1 = await user.findOne({ _id: data });
	result1._id = result1._id.toString();
	return result1;
}

async function getByPassword(p) {
    const user = await users();
    const result = await user.findOne({ password: p });
    return result;
}

async function getByLastName(name) {
    const user = await users();
    const result = await user.findOne({ lastUserName: name });
    return result;
}

async function getByFirstName(name) {
    const user = await users();
    const result = await user.findOne({ firstUserName: name });
    return result;
}

async function deleteById(id) {
	if (!id) throw 'The id has not been provided.';
	if ((typeof(id) !== 'string') || (id.length === 0))
		throw 'The id is not a string or it is empty.';
	const data = ObjectId(id);
	const user = await users();
	const result = await user.deleteOne({ _id: data });
	if (result.deleteCount === 0) throw 'The user does not exist.';
	if (result.deletedCount === 1)
		return true;
	else
		throw 'There is nothing in the collection.';
}

module.exports = {
    insertUsers,
    getByPassword,
    getByLastName,
    getByFirstName,
    updateUser,
    deleteById
};