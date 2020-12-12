var planList = $("#planList");
var planItem = $("#planItem");
var login_button = $("#login-button");
var logout_button = $("#logout-button");


planItem.hide();
logout_button.hide();
$("#loginInfo").append('<div>You have logged in the account.</div>');

function checkLogStatus() {
    $(function () {
        var checkStatus = {
            method: 'GET',
            url: '/login/status',
            contentType: 'application/json'
        };

        $.ajax(checkStatus).then(function (responseMessage) {
            var newElement = $(responseMessage);
            if (newElement[0].status === true) {
                login_button.hide();
                logout_button.show();
            }
            else {
                login_button.show();
                logout_button.hide();
            }
        });
    });
}

function getPlan() {
    var requestConfig = {
        method: 'GET',
        url: '/login/database/plans',
        contentType: 'application/json'
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        planList.append($("<dl>"));
        for (let i of newElement) {
            planList.append($("<dt><a href='http://localhost:3000' class=" + i._id + ">" + i.nodes[0].position + "</a></dt>"));
            planList.append($("<dd class=" + i._id + ">Arrival Time: " + i.nodes[0].arrival_time + "</dd>"));
            planList.append($("<dd class=" + i._id + ">Departure Time: " + i.nodes[0].departure_time + "</dd>"));
            planList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
        }
        planList.append($("</dl>"));
        $(function () {
            $(".close-sign").click(function (event) {
                event.preventDefault();
                var item = $(this).attr('id');
                $('.' + item).empty();
                $('#' + item).hide();
                var requestConfig1 = {
                    method: 'POST',
                    url: '/login/database/plansdelete',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        id: item
                    })
                };

                $.ajax(requestConfig1).then(function (responseMessage) {
                    var newElement = $(responseMessage);
                });
            });
        });
    });
}

$("#logout-button").click(function (event) {
    event.preventDefault();
    var logout = {
        method: 'GET',
        url: '/login/logout',
        contentType: 'application/json'
    };

    $.ajax(logout).then(function (responseMessage) {
        var newElement = $(responseMessage);
    });
});

checkLogStatus();
getPlan();