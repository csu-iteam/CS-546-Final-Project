const express = require('express');
const axios = require('axios');
const router = express.Router();
const recommendPicsApi = require('../config/recommendPicsApi');
const fs = require('fs');

router.get('/', async (req, res) => {
    try {
        let picsData = await getPicsData();
        let picsDataList = queryLists(picsData);
        console.log(picsDataList)

        res.render('travel/recommend', { title: "Travel Consulter", picsData: picsDataList });
    } catch (e) {
        res.status(500).send();
    }
});


async function getPicsData() {

    /*
        cause my network problem, them following code can only run with local json files.
    */
    const data = fs.readFileSync('rPicApiData.json', 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData

    /*
        cause my network problem, them following code can only run with effective network.
    */
    // const queryData = await axios.request(recommendPicsApi.rPicQ).then(async function (response) {
    //     console.log(response.data)
    //     return response.data
    // }).catch(function (error) {
    //     console.log(error)
    // })
}

function queryLists(data) {

    let dataLists = [];
    const imagePerPage = 6;
    const apiDataNumber = 110; //TODO: If use online API, shoule not be 110, 20 perhaps
    for (let i = 0; i < imagePerPage; i++) {

        let index = Math.round(apiDataNumber * Math.random());
        dataLists[i] = {

            name: data.results[index].name,
            url: data.results[index].images[0],
            location: data.results[index].location_id,
            snippet: data.results[index].snippet

        }
    }
    return dataLists
}


module.exports = router;