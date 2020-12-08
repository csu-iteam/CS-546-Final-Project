const express = require("express")
const axios = require('axios')
const router = express.Router()
const hotelApi = require('../config/hotelApi')

function renderHotelList(data, res) {
    hotelList = data.suggestions.find(o => {
        return o.group === 'HOTEL_GROUP'
    }).entities
    res.render('layouts/hotel', {hotel: hotelList})
}

router.get('/hotel/:loc', async (req, res) => {
    const locQuery = req.params.loc.trim()
    const localelang = req.headers["accept-language"].split(',')[0]
    let queryParms = {
        query: locQuery,
        locale: 'en_US'
    }
    if (locQuery !== null) {
        hotelApi.hotel.params = queryParms
        const queryData = await axios.request(hotelApi.hotel).then(async function (response) {
            console.log(response.data)
            return response.data
        }).catch(function (error) {
            console.log(error)
        })
        renderHotelList(queryData, res)
    }
})

module.exports = router