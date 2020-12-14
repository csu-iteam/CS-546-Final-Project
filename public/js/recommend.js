(function ($) {
    var recommendPicsDivOrigin = $('#recommendPics-div-origin');
    var recommendPicsDivMore = $('#recommendPics-div-more');
    var moreButton = $('#more-button');
    var moreAround = $('.more-around');

    moreButton.on('click', function (event) {
        event.preventDefault();

        const tagsLabels = [
            "subtype-Active_volcanoes|adrenaline",
            "poitype-Massage|poitype-Mountain",
            "music|poitype-Cafe",
            "poitype-Club|poitype-Convention_centre",
            "poitype-Cave|poitype-Canal",
            "poitype-Casino|poitype-Castle",
            "poitype-Cliff|poitype-Church|climate",
            "feature|hidden-Expensive|fishing",
            "sightseeing|poitype-Skyscraper",
            "sailing|poitype-Shipwrecks",
            "poitype-Fountain|golf",
            "poitype-Sight|poitype-Street",
            "poitype-Volcano|poitype-Tomb",
            "amusementparks|poitype-Bar|poitype-Canyon",
            "art|poitype-Art_gallery|architecture",
            "subtype-Natural_history_museums|poitype-Petting_zoo",
            "air|subtype-Football_stadiums|poitype-Park",
            "hiking|character-Crowded",
            "character-Quiet|wildlife",
            "poitype-Obelisk|rafting",
            "relaxinapark|poitype-River_cruise",
            "poitype-Shrine|showstheatresandmusic",
            "poitype-Shopping_centre|shopping",
            "poitype-Shopping_district|poitype-Tower",
            "poitype-Tunnel|poitype-Valley",
            "poitype-View_point|poitype-Water_ski",
            "poitype-Watermill|poitype-Waterfall",
            "watersports|character-Wheelchair_friendly",
            "poitype-Windmill|wintersport",
            "poitype-Wilderness_hut|whalewatching",
            "poitype-Wayside_shrine|zoos",
            "poitype-Theatre|poitype-Temple",
            "character-Romantic|poitype-Royal_guard",
            "poitype-Rock|riding",
            "cruises|sailing",
            "subtype-Sci-tech_museums|character-Shingle_beach",
            "poitype-Prison|poitype-Red-light_district",
            "private_tours|poitype-Pyramid",

        ]

        let index = Math.round(tagsLabels.length * Math.random());
        searchTag = tagsLabels[index];

        var requestConfig = {
            method: 'GET',
            url: `https://www.triposo.com/api/20201111/poi.json?tag_labels=${searchTag}&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq`
        };

        $.ajax(requestConfig).then(function (responseMessage) {

            var picData = $(responseMessage);
            if (picData) {
                recommendPicsDivOrigin.hide();
                recommendPicsDivMore.empty();
                recommendPicsDivMore.show();
            }

            var dataLists = queryLists(picData[0]);
            var newDiv = [];
            for (let i = 0; i < dataLists.length; i++) {
                let targetPic = dataLists[i];

                recommendPicsDivMore.append(`<div class="more-around-div"></div>`);

                if (i == 0) {
                    newDiv[i] = recommendPicsDivMore.children('div');
                } else {
                    newDiv[i] = newDiv[i - 1].next();
                }

                newDiv[i].append(`<img src=${targetPic.url.source_url} alt=${targetPic.name} width="384px" height="216px" class="image">`);
                newDiv[i].append(`<p>${targetPic.name}</p>`);
                newDiv[i].append(`<span>Location: </span><p>${targetPic.location_id}</p>`);
                newDiv[i].append(`<p>Description: ${targetPic.snippet}</p>`);
                newDiv[i].append(`<button class="more-around">See more around this place</button>`);
            }

        })
        moreButton.text("More");
    })


    moreAround.each(function () {

        $(this).on('click', function (event) {

            event.preventDefault();

            const location_id = $(this).prev().prev().text();
            console.log(location_id)
            var requestConfig = {
                method: 'GET',
                url: `https://www.triposo.com/api/20201111/poi.json?location_id=${location_id}&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq`
            };

            $.ajax(requestConfig).then(function (responseMessage) {

                var picData = $(responseMessage);
                if (picData) {
                    recommendPicsDivOrigin.hide();
                    recommendPicsDivMore.empty();
                    recommendPicsDivMore.show();
                }

                var dataLists = queryLists(picData[0]);
                if (dataLists) {

                    for (let i = 0; i < dataLists.length; i++) {
                        let targetPic = dataLists[i];

                        recommendPicsDivMore.append(`<img src=${targetPic.url.source_url} alt=${targetPic.name} width="384px" height="216px" class="image">`);
                        recommendPicsDivMore.append(`<p>${targetPic.name}</p>`);
                        recommendPicsDivMore.append(`<span>Location: </span><p>${targetPic.location_id}</p>`);
                        recommendPicsDivMore.append(`<p>Description: ${targetPic.snippet}</p>`);
                    }
                }

            })
            moreButton.text("Not here");
        })
    })


    function queryLists(data) {

        let dataLists = [];
        const imagePerPage = 6;
        if (data.results) {

            for (let i = 0; i < imagePerPage; i++) {

                dataLists[i] = {

                    name: data.results[i].name,
                    url: data.results[i].images[0],
                    location_id: data.results[i].location_id,
                    snippet: data.results[i].snippet,
                    coordinates: data.results[i].coordinates,
                    score: data.results[i].score,
                    booking_info: data.results[i].booking_info,
                    attribution: data.results[i].attribution,
                    price_tier: data.results[i].price_tier,

                }
            }
        }
        return dataLists
    }
})(window.jQuery);