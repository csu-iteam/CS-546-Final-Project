const express = require("express")
const axios = require('axios')
const streamArray = require('stream-json/streamers/StreamArray')
const Fuse = require('fuse.js')
const fs = require('fs')
const router = express.Router()
const hotelApi = require('../config/hotelApi')

// read Airport JSON
let airportData = []
// function readAirportJson(){
//    return new Promise(((resolve, reject) => {
//        const jsonStream = streamArray.withParser()
//        const jsonPipe = fs.createReadStream('./data/airports.json').pipe(jsonStream.input)
//        jsonStream
//            .on('data', ({key, value}) => {
//                airportData.push({key, value})
//            })
//            .on('end', () => {
//                console.log('json read all done')
//                resolve(Data)
//            })
//    }))
// }

const jsonStream = streamArray.withParser()

const jsonPipe = fs.createReadStream('./data/airports.json').pipe(jsonStream.input)

jsonStream.on('data', ({key, value}) => {
    airportData.push({key, value})
})

jsonStream.on('end', () => {
    console.log('Airport json read all done')
})

let cityInfo
let cityTransport = []

function getTransportList(data) {
    cityTransport = data.suggestions.find(o => {
        return o.group === 'TRANSPORT_GROUP'
    }).entities
    return cityTransport
}

function getAirportNameList(data) {
    return getTransportList(data).filter(o => o.type === 'AIRPORT').map(o => o.name);
}

function getIATAList(name) {
    let nameList = getAirportNameList(cityInfo)
    let iataList
    //fuse config
    const options = {
        includeScore: true,
        shouldSort: true,
        threshold: 0.3,
        keys: ['value.name']
    }
    const fuse = new Fuse(airportData, options)

    let result = fuse.search(name)

    iataList = result.map(o => o.item.value.iata)
    // console.log(result)
    return iataList
}

function getCityDestinationIdlList(data) {
    cityList = data.suggestions.find(o => {
        return o.group === 'CITY_GROUP'
    }).entities
    let desIdArray = []
    for (i of cityList) {
        desIdArray.push(i.destinationId)
    }
    return {cityList, desIdArray}
}

async function renderHotelList(data, res) {
    let results = getCityDestinationIdlList(data)

    hotelList = await queryHotelList(results.desIdArray)

    res.render('layouts/hotel',
        {
            location: results.cityList,
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

async function queryCity(name) {
    let queryParms = {
        query: name,
        locale: 'en_US'
    }
    if (name !== null) {
        hotelApi.locQ.params = queryParms
        return await axios.request(hotelApi.locQ).then(async function (response) {
            console.log(response.data)
            cityInfo = response.data
            return response.data
        }).catch(function (error) {
            console.log(error)
        })
    }
}

router.get('/hotel/:loc', async (req, res) => {
    const locQuery = req.params.loc.trim()
    const localelang = req.headers["accept-language"].split(',')[0]
    if (locQuery !== null) {
        const queryData = await queryCity(locQuery)
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

router.get('/airline/:loc', async function (req, res) {
    const locQuery = req.params.loc.trim()
    await queryCity(locQuery)
    if (locQuery !== null) {
        console.log(getIATAList(locQuery))
    }
})

module.exports = router