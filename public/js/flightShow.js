(function ($) {
    let flighShow = $('#flightShow')
    let ticketList = $('#ticketList')
    let airform = $('#airline-pick')

    $("#loadingAni").hide();

    function combineObj(dataArray) {
        let obj = {}
        let keyData, valueData
        $.each(dataArray, function () {
            item = $(this)
            keyData = item[0].name
            valueData = item[0].value
            obj[keyData] = valueData
        })
        return obj
    }


    $(document).ajaxStart(function () {
        $("#loadingAni").show();
        let btn = $('.btn')
        btn.on('click', function () {
            $(this).addClass('btn__progress');
            setTimeout(function () {
                btn.addClass('btn__progress--fill')
            }, 500);
            setTimeout(function () {
                btn.removeClass('btn__progress--fill')
            }, 4100);
            setTimeout(function () {
                btn.addClass('btn__complete')
            }, 4400);
        })
    })

    airform.submit(function (e) {
        e.preventDefault()
        let formData = airform.serializeArray()

        let queryParam = combineObj(formData)

        let requestConfig = {
            method: 'POST',
            url: '/price/airline',
            data: queryParam
        }

        $.when(
            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage)
                responseMessage.data.forEach((item) => {
                    ticketList.append(`<li><div>from ${item.itineraries[0].segments[0].departure.iataCode}</div><div>to ${item.itineraries[0].segments[0].arrival.iataCode}</div><div>Price ${item.price.base}</div></li>`)
                })
            })
        ).done(function (response) {
            $("#loadingAni").hide();
        })
    })

})(window.jQuery)