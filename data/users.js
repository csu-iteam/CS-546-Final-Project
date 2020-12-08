const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
let { ObjectId } = require('mongodb');

async function insertUsers(lastUserName, firstUserName, password, nickName, plansId, logsId) {
    const user = await users();
    const newInsert = {
        lastUserName: lastUserName,
        firstUserName: firstUserName,
        password: password,
        nickName: nickName,
        plansId: plansId,
        logsId: logsId
    };
    const result = await user.insertOne(newInsert);
    if (result.insertedCount === 0) {
        console.log('There is nothing inserted.');
    }
    const id = result.insertedId;
    return id.toString();
}

async function getByPassword(p) {
    const user = await users();
    const result = await user.findOne({ password: p });
    return result;
}

module.exports = {
    insertUsers,
    getByPassword
};