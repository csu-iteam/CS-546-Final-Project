//core algorithm
//unit of time in minutes
//node add duration attribution
const axios = require("axios");
const airports = require("./airports");
const iatas = require("./cityQuery");

let maxWaitTime = 180;//3 hours wait for flight
let minPrepareTime = 60;//1 hour prepare for flight
let dailyStartTime = 480;//8:00
let dailyEndTime = 1320;//22:00
let dailyMaxEndTime = 1440;//24:00
let maxFlightSearch = 20;

async function findLowestCostPlan(sourceNodeList) {
    //sourceNodeList index0=start position index length-1=end postion
    let startPositon = sourceNodeList[0];
    let endPosition = sourceNodeList[sourceNodeList.length - 1];
    sourceNodeList.splice(0, 1);
    //sourceNodeList.splice(sourceNodeList.length - 1, 1);
    let allPlans = generateArrangement(sourceNodeList, [], []);
    //console.log(allPlans);
    let allPlansWithCost = [];
    for (let i = 0; i < allPlans.length; i++) {
        let tempPlan = allPlans[i];
        tempPlan.splice(0, 0, startPositon);
        //console.log(tempPlan);
        //tempPlan.push(endPosition);
        let mPlan = await makePlan(tempPlan);
        //console.log(mPlan);
        if (mPlan.type == "faild") continue;
        else {
            allPlansWithCost.push(mPlan);
        }
    }
    let lowestCost = allPlansWithCost[0].cost;
    let planIndex = -1;
    for (let i = 0; i < allPlansWithCost.length; i++) {
        if (allPlansWithCost[i].cost <= lowestCost) {
            lowestCost = allPlansWithCost[i].cost;
            planIndex = i;
        }
    }
    return allPlansWithCost[planIndex];
}

function generateArrangement(nodeList, currentPlan, planList) {
    if (nodeList.length == 0) {
        planList.push(currentPlan);
        return planList;
    } else {
        for (let i = 0; i < nodeList.length; i++) {
            currentPlan.push(nodeList[i]);
            let temp=nodeList;
            temp.splice(i, 1)
            planList.concat(generateArrangement(temp, currentPlan, planList));
        }
        return planList;
    }
}

//startNode location_id name startDate coordinates{latitude,longtitude} 
//return {plan duration endtime type cost}
async function makePlan(nodeList) {
    //startnode
    let day = 1;
    let cost = 0;
    let timePoint = dailyStartTime;
    let plan = [];
    let startNode = nodeList[0];
    //let endNode = nodeList[nodeList.length - 1];
    let startDate = startNode.startDate;
    let start = {
        type: "start",
        startNode: startNode,
        day: day
    }
    plan.push(start);
    //other nodes
    for (let i = 1; i < nodeList.length; i++) {
        if (timePoint >= dailyEndTime) {// past end time
            day++;
            timePoint = dailyStartTime;
        }
        // console.log(nodeList[0].location_id);
        // console.log(nodeList[1].location_id);
        if (isInSameCity(nodeList[i - 1].location_id, nodeList[i].location_id)) {
            //same city
            let trafficRoute = await getCityTraffic(nodeList[i - 1].coordinates, nodeList[i].coordinates);
            let duration = Math.ceil(trafficRoute.duration / 60);
            if ((timePoint + duration) > dailyMaxEndTime) {
                //past acceptable end time
                day++;
                timePoint = dailyStartTime;
            }
            timePoint += duration;
            let trafficNode = {
                type: "traffic",
                route: trafficRoute,
                day: day
            }
            plan.push(trafficNode);
            let playDuration = node[i].duration;
            if (timePoint > dailyEndTime || (timePoint + playDuration) > dailyMaxEndTime) {
                day++;
                timePoint = dailyStartTime;
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            }
        } else {
            // different city
            // find airport coordinates
            
            let startIata = await getCityIata(nodeList[i - 1].location_id);
            let endIata = await getCityIata(nodeList[i].location_id);
            let startAirport = await findAirport(nodeList[i - 1]);
            let endAirport = await findAirport(nodeList[i]);

            console.log("startIata"+startIata)
            console.log("endIata"+endIata)
            console.log(startAirport)
            console.log(endAirport)

            // traffic to airport
            let trafficRoute = await getCityTraffic(nodeList[i - 1].coordinates, startAirport);
            let duration = Math.ceil(trafficRoute.duration / 60);
            let tempStartDate = startDate;
            let flight = await getFlight(startIata, endIata, tempStartDate.setDate(tempStartDate.getDate() + day), timePoint + duration + minPrepareTime);
            //transform flight timetable
            let departureTime = transformFlightTime(flight.itineraries[0].segments[0].departure.at);
            let arrivalTime = transformFlightTime(flight.itineraries[0].segments[0].arrival.at);

            if (arrivalTime > dailyMaxEndTime || arrivalTime < departureTime) {//exceed daliy plan
                day++;
                timePoint = dailyStartTime;
                tempStartDate = startDate;
                flight = await getFlight(startIata, endIata, tempStartDate.setDate(tempStartDate.getDate() + day), timePoint + duration + minPrepareTime);
                departureTime = transformFlightTime(flight.itineraries[0].segments[0].departure.at);
                arrivalTime = transformFlightTime(flight.itineraries[0].segments[0].arrival.at);
                let trafficNode = {
                    type: "traffic",
                    route: trafficRoute,
                    day: day
                }
                plan.push(trafficNode);
                let flightNode = {
                    type: "flight",
                    flight: flight,
                    day: day
                }
                cost += parseFloat(flight.price.total);
                plan.push(flightNode);
                timePoint = arrivalTime;
            } else {
                let trafficNode = {
                    type: "traffic",
                    route: trafficRoute,
                    day: day
                }
                plan.push(trafficNode);
                let flightNode = {
                    type: "flight",
                    flight: flight,
                    day: day
                }
                cost += parseFloat(flight.price.total);
                plan.push(flightNode);
                timePoint = arrivalTime;
            }
            //traffic from airport to poi
            let trafficRoute2 = await getCityTraffic(endAirport, nodeList[i].coordinates);
            let duration2 = Math.ceil(trafficRoute2.duration / 60);
            if (timePoint >= dailyEndTime) {//exceed daily plan
                day++;
                timePoint = dailyStartTime;
                let trafficNode = {
                    type: "traffic",
                    route: trafficRoute2,
                    day: day
                }
                plan.push(trafficNode);
                timePoint += duration2;
            } else {
                if ((timePoint + duration2) > dailyMaxEndTime) {//exceed daily plan
                    day++;
                    timePoint = dailyStartTime;
                    let trafficNode = {
                        type: "traffic",
                        route: trafficRoute2,
                        day: day
                    }
                    plan.push(trafficNode);
                    timePoint += duration2;
                } else {
                    let trafficNode = {
                        type: "traffic",
                        route: trafficRoute2,
                        day: day
                    }
                    plan.push(trafficNode);
                    timePoint += duration2;
                }
            }
            let playDuration = node[i].duration;
            if (timePoint > dailyEndTime || (timePoint + playDuration) > dailyMaxEndTime) {
                day++;
                timePoint = dailyStartTime;
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.push(poiNode);
            }
        }

    }
    return {
        plan: plan,
        cost: cost,
        duration:day,
        type: "success"
    }
}

//
async function getFlight(startIata, endIata, startDate, startTime) {
    let lowestFlight;
    let latestStartTime = startTime + maxWaitTime;
    const { data } = await axios.get(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${startIata}&destinationLocationCode=${endIata}&departureDate=${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}&adults=1&max=${maxFlightSearch}`);
    let flightList = data.data;
    for (let i = 0; i < flightList.length; i++) {
        let dTime = transformFlightTime(flightList[i].itineraries.segments.departure.at);
        if (dTime >= startTime && dTime <= latestStartTime) {
            if (!lowestFlight) {
                lowestFlight = flightList[i];
            } else if (flightList[i].price.total < lowestFlight.price.total) {
                lowestFlight = flightList[i];
            }
        }
    }
    return lowestFlight;
}

function isInSameCity(startLocation, endLocation) {
    return (startLocation == endLocation);
}

//commuting route in the city  
async function getCityTraffic(startCoordinates, endCoordinates) {
    const { data } = await axios.get(`http://api.map.baidu.com/direction_abroad/v1/transit?origin=${startCoordinates.latitude.toFixed(6)},${startCoordinates.longitude.toFixed(6)}&destination=${endCoordinates.latitude.toFixed(6)},${endCoordinates.longitude.toFixed(6)}&coord_type=wgs84&ak=up1toaVyKpIE6fXc9dqc4eItjbhICylS`);
    let routes = data.routes;
    return routes[0];
}

// find airport coordinates
async function findAirport(node) {
    let iata = await getCityIata(node.location_id);
    let location = airports.airports.get(iata);
    return {
        latitude: location[0],
        longitude: location[1]
    }
}

async function transformFlightTime(flightTime) {
    let list = flightTime.split("T");
    let time = list[1].split(":");
    return Number(time[0]) * 60 + Number(time[1]);
}

async function getCityIata(cityName) {
    let iatalist = await iatas.getIATAList(cityName);
    return iatalist[0];
}
let i = 0;
async function getPoi(searchTerm) {
    //let result=await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchTerm}&inputtype=textquery&fields=photos,formatted_address,name,plus_code,geometry&key=AIzaSyDkFqsopNObdSVwPslxnZEFBOG6AVXeVgg`);
    
    let result = {
        "candidates": [
            {
                "formatted_address": "179 Shaftesbury Ave, West End, London WC2H 8JR, United Kingdom",
                "geometry": {
                    "location": {
                        "lat": 51.5151226,
                        "lng": -0.127327
                    },
                    "viewport": {
                        "northeast": {
                            "lat": 51.51643612989272,
                            "lng": -0.1258604701072778
                        },
                        "southwest": {
                            "lat": 51.51373647010728,
                            "lng": -0.1285601298927222
                        }
                    }
                },
                "name": "Forbidden Planet London Megastore",
                "photos": [
                    {
                        "height": 1152,
                        "html_attributions": [
                            "\u003ca href=\"https://maps.google.com/maps/contrib/104930906938168950776\"\u003eForbidden Planet London Megastore\u003c/a\u003e"
                        ],
                        "photo_reference": "ATtYBwLoJVHQi1vjHJwDPto_sIJENJ-_0_Vyka1O70b0aEbWMrk0gVIsUOzNPgBFrXuuIXWAJXexBOJeYLOk2H7JNlViVSdD_wCh58JXWdMq2Aj-AczB75pT2WzJ1Ui_XM80uSSaqg8qp_1ggVi98h6S5iyfEqgE_c6CZMStiSufQm84b2y9",
                        "width": 2048
                    }
                ]
            }
        ],
        "status": "OK"
    }
    let result2 = {
        "candidates": [
            {
                "formatted_address": "2684 Lacy St, Los Angeles, CA 90031, United States",
                "geometry": {
                    "location": {
                        "lat": 34.0833839,
                        "lng": -118.2180313
                    },
                    "viewport": {
                        "northeast": {
                            "lat": 34.08481272989273,
                            "lng": -118.2167674701073
                        },
                        "southwest": {
                            "lat": 34.08211307010728,
                            "lng": -118.2194671298927
                        }
                    }
                },
                "name": "Yellow LA"
            }
        ],
        "status": "OK"
    }

    if (i == 1) {
        return result2
    }
    i++;
    return result;
}


module.exports = {
    findLowestCostPlan, getPoi
}