//core algorithm
//unit of time in minutes
//node add duration attribution
const axios = require("axios");
const airpots = require("./airpots");

let maxWaitTime = 180;//3 hours wait for flight
let minPrepareTime = 60;//1 hour prepare for flight
let dailyStartTime = 480;//8:00
let dailyEndTime = 1320;//22:00
let dailyMaxEndTime = 1440;//24:00
let maxFlightSearch = 20;

async function findLowestCostPlan(sourceNodeList) {
    //sourceNodeList index0=start position index length-1=end postion
    let startPositon = sourceNodeList[0];
    let endPosition = sourceNodeList[length - 1];
    sourceNodeList.splice(0, 1);
    sourceNodeList.splice(sourceNodeList.length - 1, 1);
    let allPlans = generateArrangement(sourceNodeList, [], []);
    //console.log(allPlans);
    let allPlansWithCost = [];
    for (let i = 0; i < allPlans.length; i++) {
        let tempPlan = allPlans[i];
        tempPlan.splice(0, 0, startPositon);
        tempPlan.add(endPosition);
        let mPlan = makePlan(tempPlan);
        if (mPlan.type == "faild") continue;
        else {
            allPlansWithCost.add();
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

async function generateArrangement(nodeList, currentPlan, planList) {
    if (nodeList.length == 0) {
        planList.add(currentPlan);
        return planList;
    } else {
        for (let i = 0; i < nodeList.length; i++) {
            currentPlan.add(nodeList[i]);
            planList.add(generateArrangement(nodeList.splice(i, 1), currentPlan, planList));
        }
    }
    return planList;
}

//startNode location_id name startDate coordinates{latitude,longtitude} 
//return {plan duration endtime type cost}
async function makePlan(nodeList) {
    //startnode
    let day = 1;
    let timePoint = dailyStartTime;
    let plan = [];
    let startNode = nodeList[0];
    let endNode = nodeList[nodeList.length - 1];
    let startDate = startNode.startDate;
    let start = {
        type: "start",
        startNode: startNode,
        day: day
    }
    plan.add(start);
    //other nodes
    for (let i = 1; i < (nodeList.length - 1); i++) {
        if (timePoint >= dailyEndTime) {// past end time
            day++;
            timePoint = dailyStartTime;
        }
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
            plan.add(trafficNode);
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
                plan.add(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.add(poiNode);
            }
        } else {
            // different city
            // find airport coordinates
            let startIata = await getCityIata(nodeList[i - 1].location_id);
            let endIata = await getCityIata(nodeList[i].location_id);
            let startAirport = await findAirport(nodeList[i - 1]);
            let endAirport = await findAirport(nodeList[i]);

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
                plan.add(trafficNode);
                let flightNode = {
                    type: "flight",
                    flight: flight,
                    day: day
                }
                plan.add(flightNode);
                timePoint = arrivalTime;
            } else {
                let trafficNode = {
                    type: "traffic",
                    route: trafficRoute,
                    day: day
                }
                plan.add(trafficNode);
                let flightNode = {
                    type: "flight",
                    flight: flight,
                    day: day
                }
                plan.add(flightNode);
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
                plan.add(trafficNode);
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
                    plan.add(trafficNode);
                    timePoint += duration2;
                } else {
                    let trafficNode = {
                        type: "traffic",
                        route: trafficRoute2,
                        day: day
                    }
                    plan.add(trafficNode);
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
                plan.add(poiNode);
            } else {
                let poiNode = {
                    type: "poi",
                    poi: nodeList[i],
                    day: day
                }
                timePoint += playDuration;
                plan.add(poiNode);
            }
        }

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

async function isInSameCity(startLocation, endLocation) {
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
    let location = airpots.airports.get(iata);
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

}
module.exports = {
    findLowestCostPlan
}