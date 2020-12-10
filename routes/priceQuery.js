const express = require("express")
const axios = require('axios')
const router = express.Router()
const hotelApi = require('../config/hotelApi')

async function renderHotelList(data, res) {
    locList = data.suggestions.find(o => {
        return o.group === 'CITY_GROUP'
    }).entities
    let desIdArray = []
    for (i of locList) {
        desIdArray.push(i.destinationId)
    }
    hotelList = await queryHotelList(desIdArray)

    res.render('layouts/hotel',
        {
            location: locList,
            hotels: hotelList
        })
}

async function queryHotelList(data) {
    let nowDate = new Date()
    let inData = nowDate.toISOString().split('T')[0]
    let outData = new Date(nowDate.setDate(nowDate.getDate() + 3)).toISOString().split('T')[0]

    let queryParms = {
        pageNumber: '1',
        checkIn: inData,
        checkOut: outData,
        pageSize: '25',
        adults1: '1',
        currency: 'USD',
        locale: 'en_US',
        sortOrder: 'PRICE'
    }

    let hotelList = []
    for (i of data) {
        queryParms.destinationId = i
        hotelApi.hotQ.params = queryParms
        hotelList.push(await axios.request(hotelApi.hotQ).then(function (response) {
            console.log(response.data.data.body.searchResults.results)
            return response.data.data.body.searchResults.results
        }).catch(function (error) {
            console.log(error)
        }))
    }
    return hotelList
}

router.get('/hotel/:loc', async (req, res) => {
    const locQuery = req.params.loc.trim()
    const localelang = req.headers["accept-language"].split(',')[0]
    let queryParms = {
        query: locQuery,
        locale: 'en_US'
    }
    if (locQuery !== null) {
        hotelApi.locQ.params = queryParms
        const queryData = await axios.request(hotelApi.locQ).then(async function (response) {
            console.log(response.data)
            return response.data
        }).catch(function (error) {
            console.log(error)
        })
        renderHotelList(queryData, res)
    }
})

router.get('/meal/:loc', async (req, res) => {
    const locQuery = req.params.loc.trim()
    if (locQuery !== null) {
        res.render('layouts/meal')
    } else {
        let messErr = 'No location'
        res.render('layouts/error',
            {errorMes: messErr})
    }
})

module.exports = router