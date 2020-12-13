(function ($) {
    var recommendPicsDivOrigin = $('#recommendPics-div-origin');
    var recommendPicsDivMore = $('#recommendPics-div-more');
    var moreButton = $('#more-button');

    moreButton.click(function (event) {
        event.preventDefault();

        var requestConfig = {
            method: 'GET',
            url: 'https://www.triposo.com/api/20201111/poi.json?&account=T9TV2POT&token=2wve45tezxoq0kvv3dpd4odygaeb50rq'
        };

        $.ajax(requestConfig).then(function (responseMessage) {

            var picData = $(responseMessage);
            if (picData) {
                recommendPicsDivOrigin.hide();
                recommendPicsDivMore.empty();
                recommendPicsDivMore.show();
            }

            console.log(picData[0])

            var dataLists = queryLists(picData[0]);
            for (let i = 0; i < dataLists.length; i++) {
                let targetPic = dataLists[i];
                recommendPicsDivMore.append(`<img src=${targetPic.url.source_url} alt=${targetPic.name} width="384px" height="216px" class="image">`);
                recommendPicsDivMore.append(`<p>${targetPic.name}</p>`);
                recommendPicsDivMore.append(`<p>${targetPic.location_id}</p>`);
                recommendPicsDivMore.append(`<p>${targetPic.snippet}</p>`);
            }

        })
    })


    function queryLists(data) {

        let dataLists = [];
        const imagePerPage = 6;
        const apiDataNumber = 9;
        for (let i = 0; i < imagePerPage; i++) {

            let index = Math.round(apiDataNumber * Math.random());
            dataLists[i] = {

                name: data.results[index].name,
                url: data.results[index].images[0],
                location_id: data.results[index].location_id,
                snippet: data.results[index].snippet,
                coordinates: data.results[index].coordinates,
                score: data.results[index].score,
                booking_info: data.results[index].booking_info,
                attribution: data.results[index].attribution,
                price_tier: data.results[index].price_tier,

            }
        }
        return dataLists
    }
})(window.jQuery);