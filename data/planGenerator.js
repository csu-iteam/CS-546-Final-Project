//core algorithm
//unit of time in minutes

let maxWaitTime = 180;//3 hours wait for flight
let minPrepareTime = 60;//1 hour prepare for flight
let dailyStartTime = 480;//8:00
let dailyEndTime = 1320;//22:00
let dailyMaxEndTime = 1440;//24:00

function findLowestCostPlan(sourceNodeList) {
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

function generateArrangement(nodeList, currentPlan, planList) {
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
function makePlan(nodeList) {
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
            let trafficRoute = getCityTraffic(nodeList[i - 1].coordinates, nodeList[i].coordinates);
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
        } else {
            // different city
            // find airport coordinates
            let startAirport = findAirport(nodeList[i - 1]);
            let endAirport = findAirport(nodeList[i]);
            // traffic to airport
            let trafficRoute = getCityTraffic(nodeList[i - 1].coordinates, startAirport);
            let duration = Math.ceil(trafficRoute.duration / 60);
            let flight = getFlight(startAirport, endAirport, timePoint + duration + minPrepareTime);
            //transform flight timetable
            let departureTime = transformFlightTime(flight.itineraries[0].segments[0].departure.at);
            let arrivalTime = transformFlightTime(flight.itineraries[0].segments[0].arrival.at);

            if (arrivalTime > dailyMaxEndTime || arrivalTime < departureTime) {//exceed daliy plan
                day++;
                timePoint = dailyStartTime;
                flight = getFlight(startAirport, endAirport, timePoint + duration + minPrepareTime);
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
            let trafficRoute2 = getCityTraffic(endAirport, nodeList[i].coordinates);
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
        }
    }
}

//
function getFlight(startLocation, endLoction, startTime) {
    let flight

    return flight;
}

function isInSameCity(startLocation, endLocation) {

}

//commuting time in the city  
function getCityTraffic(startCoordinates, endCoordinates) {

}

// find airport coordinates
function findAirport(poiNode) {

}

function transformFlightTime(flightTime) {
    
}
