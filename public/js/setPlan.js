
//jQuery.support.cors = true;
(function ($) {
    var placeId = 0;
    var addPlace = $('#addPlace'),
        nodeList = $('#nodeList'),
        searchPlace = $('#searchPlace'),
        searchTerm = $('#searchTerm'),
        errorBox = $('#errorBox'),
        planList = [],
        //currentSearchList = [],
        resultList = $('#resultList'),
        placeForm = $('#placeForm'),
        dDate = $('#startDate'),
        scheme = $('#scheme');
    errorBox.hide();

    // addPlace.on('click', function (event) {
    //     event.preventDefault();
    //     let newPlace = document.createElement('li');
    //     console.log(newPlace);
    //     newPlace.innerHTML = `<label for='place${placeCount}'>Place<input type='text' id='place${placeCount}'/></label>
    //     <button id='${placeCount}' onclick=removePlace(${placeCount})>remove this place</button>`;
    //     //newPlace.attr('id', `div${placeCount}`);
    //     newPlace.id = `li${placeCount}`;
    //     nodeList.append(newPlace);
    //     placeCount++;
    // })

    searchPlace.on('click', function (event) {
        event.preventDefault();
        var sTerms = searchTerm.val();
        if (sTerms.trim() == "") {
            resultList.empty();
            errorBox.html("<label>please input search term!</label>");
            errorBox.show();
        } else {
            errorBox.hide();
            resultList.empty();
            currentSearchList = [];
            var requestSearchPlace = {
                method: 'GET',
                //searchTerm:sTerms,
                url: `/plan/getPlace/${sTerms}`
                //url:'http://api.tvmaze.com/shows'
                //url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${sTerms}&inputtype=textquery&fields=photos,formatted_address,name,geometry&key=AIzaSyDkFqsopNObdSVwPslxnZEFBOG6AVXeVgg`
            }

            $.ajax(requestSearchPlace).then(function (responseSearchPlace) {
                // responseSearchPlace = {
                //     "candidates": [
                //         {
                //             "formatted_address": "2684 Lacy St, Los Angeles, CA 90031, United States",
                //             "geometry": {
                //                 "location": {
                //                     "lat": 34.0833839,
                //                     "lng": -118.2180313
                //                 },
                //                 "viewport": {
                //                     "northeast": {
                //                         "lat": 34.08481272989273,
                //                         "lng": -118.2167674701073
                //                     },
                //                     "southwest": {
                //                         "lat": 34.08211307010728,
                //                         "lng": -118.2194671298927
                //                     }
                //                 }
                //             },
                //             "name": "Yellow LA"
                //         }
                //     ],
                //     "status": "OK"
                // }
                let currentSearchList = responseSearchPlace.candidates;
                //console.log(responseSearchPlace);
                if (currentSearchList.length == 0) {
                    errorBox.html("place not found");
                    errorBox.show();
                } else {
                    errorBox.hide();
                    var searchId = 0;
                    for (let i of currentSearchList) {
                        let li = document.createElement('li');
                        li.innerHTML = `<label>${i.name}</label>
                                    <button id="b${searchId}" class="btn btn-outline-primary mb-3">add to plan</button>`;
                        //onclick=addPlace(${searchId})
                        li.id = `sr${searchId}`;
                        resultList.append(li);
                        $(`#b${searchId}`).on('click', function (event) {
                            event.preventDefault();
                            let place = currentSearchList[this.id.split('b')[1]];
                            let name = place.name;
                            let samePlace = false;
                            for (let i of planList) {
                                if (i.name == name) {
                                    samePlace = true;
                                }
                            }
                            if (samePlace) {
                                errorBox.html("don't add same place");
                                errorBox.show();
                            } else {
                                errorBox.hide();
                                let latitude = place.geometry.location.lat;
                                let longitude = place.geometry.location.lng;
                                //let address = place.formatted_address.split(",");
                                let splitedArray = place.plus_code.compound_code.split(',');
                                let city = splitedArray[splitedArray.length - 2];
                                let location_id = city.slice(city.indexOf(' ') + 1);
                                //console.log(location_id);
                                let duration = (parseInt(6 * Math.random()) + 1) * 30;
                                var node = {
                                    id: placeId,
                                    name: name,
                                    location_id: location_id,
                                    duration: duration,
                                    coordinates: {
                                        latitude: latitude,
                                        longitude: longitude
                                    }
                                }
                                planList.push(node);
                                let li2 = document.createElement('li');
                                li2.innerHTML = `<label>${name}</label>
                                    <button id='${placeId}' class="btn btn-outline-primary mb-3">remove this place</button>`;
                                li2.id = `place${placeId}`;
                                nodeList.append(li2);
                                $(`#${placeId}`).on('click', function (event) {
                                    event.preventDefault();
                                    var target = $(`#place${this.id}`);
                                    target.remove();
                                    for (let i = 0; i < planList.length; i++) {
                                        if (this.id == planList[i].id) {
                                            planList.splice(i, 1);
                                            break;
                                        }
                                    }
                                })
                                placeId++;
                                resultList.empty();
                            }
                        });
                        searchId++;
                    }
                }
            })
        }
    })

    placeForm.submit(function (event) {
        event.preventDefault();
        let startDate = dDate.val();
        if (startDate == "") {
            errorBox.html("you must set a start date");
            errorBox.show();
        } else if (planList.length < 2) {
            errorBox.html("you must have at least two place node");
            errorBox.show();
        } else {
            errorBox.hide();
            let sd = startDate.split("-");
            let date = new Date();
            date.setFullYear(sd[0]);
            let month = parseInt(sd[1]);
            month--;
            date.setMonth(month);
            date.setDate(sd[2]);
            let sn = planList[0];
            sn.startDate = date;
            planList.splice(0, 1);
            planList.splice(0, 0, sn);
            console.log(planList);
            var requestMakePlan = {
                method: 'POST',
                data: { data: JSON.stringify(planList) },
                url: '/plan/generate_plan'
            }
            $.ajax(requestMakePlan).then(function (result) {
                //scheme.empty();
                var plan = result.plan;

                $('#scheme').append($('<p>test</p>'));
                //let newDiv = document.createElement("div")
                //newDiv.html(`${plan}`);
                //for (i of plan) {
                //    let newDiv = document.createElement("div");
                //     newDiv.html(i);
                //    scheme.append(newDiv);
                // }
                scheme.html(JSON.stringify(result));
            })
            scheme.append(`<p>123</p>`)
        }
    })

    // function addPlace(searchId) {
    //     let place = currentSearchList[searchId];
    //     console.log("x")
    //     let name = place.name;
    //     let latitude = place.geometry.location.lat;
    //     let longitude = place.geometry.location.lng;
    //     let address = place.formatted_address.split(",");
    //     let location_id = address[address.length - 3];
    //     let duration = (parseInt(6 * Math.random()) + 1) * 30;
    //     var node = {
    //         id: placeId,
    //         name: name,
    //         location_id: location_id,
    //         duration: duration,
    //         coordinates: {
    //             latitude: latitude,
    //             longitude: longitude
    //         }
    //     }
    //     planList.push(node);
    //     //planList.add(node);
    //     let li = document.createElement('li');
    //     li.innerHTML = `<label>${name}</label>
    //      <button id='${placeId}' onclick=removePlace(${placeId})>remove this place</button>`;
    //     li.id = `place${placeId}`;
    //     nodeList.append(li);
    //     placeId++;
    //     resultList.empty();
    // }

    // function removePlace(id) {
    //     var target = $(`#place${id}`);
    //     target.remove();
    //     for (let i = 0; i < planList.length; i++) {
    //         if (id == planList[i].id) {
    //             planList.splice(i, 1);
    //             break;
    //         }
    //     }
    // }

})(window.jQuery);