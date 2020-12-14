var planList = $("#planList");
var planItem = $("#planItem");
var login_button = $("#login-button");
var logout_button = $("#logout-button");
var logList = $("#logList");


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

function getLog() {
    var getlog = {
        method: 'GET',
        url: '/login/database/logs',
        contentType: 'application/json'
    };

    $.ajax(getlog).then(function (responseMessage) {
        var newElement = $(responseMessage);
        logList.append($("<dl>"));
        for (let i of newElement) {
            logList.append($("<dt><a class=loghref id=" + "loghref" + i._id + " href='http://localhost:3000/login/personal/plans'>" + i.title + "</a></dt>"));
            logList.append($("<dd class=" + i._id + ">" + i.feel + "</dd>"));
            logList.append($("<dd class=" + i._id + ">Reading: " + i.reading + "</dd>"));
            logList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
        }
        logList.append($("</dl>"));

        $(".loghref").click(function (event) {
            event.preventDefault();
            var logId = $(this).attr('id').substring(7);
        //console.log(logId);
            var logreading = {
                method: 'POST',
                url: '/login/database/logsUpdate',
                contentType: 'application/json',
                data: JSON.stringify({
                    logId: logId,
                    reading: 1
                })
            };
        
            $.ajax(logreading).then(function (responseMessage) {
                var newElement = $(responseMessage);
                $(location).attr('href', 'http://localhost:3000/login/personal/plans');
            });
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
            planList.append($("<button class='make-log' id=" + "log" + i._id + ">Make your log</button>"));
            planList.append($("<div id=" + "logtitle" + i._id + "><label>Make a title of this log：</label><input id=" + "loginput" + i._id + " type='text' name='log-title' /></div>"));
            planList.append($("<div id=" + "logfeel" + i._id + "><label>What is your thought of this trip：</label><input id=" + "loginput1" + i._id + " type='text' name='log-feel' /></div>"));
            planList.append($("<button class='logsubmit' id=" + "logsubmit" + i._id + ">submit</button>"));
            planList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
            $('#logtitle' + i._id).hide();
            $('#logfeel' + i._id).hide();
            $('#logsubmit' + i._id).hide();
        }
        planList.append($("</dl>"));

        var planId;
        var logTitle;
        var logFeel;
        var logsubmit;
        var loginput;
        var loginput1;

        $(".make-log").click(function (event) {
            event.preventDefault();
            planId = $(this).attr('id').substring(3);
            logTitle = "logtitle" + planId;
            logFeel = "logfeel" + planId;
            logsubmit = "logsubmit" + planId;
            loginput = "loginput" + planId;
            loginput1 = "loginput1" + planId;
            $('#' + logTitle).show();
            $('#' + logFeel).show();
            $('#' + logsubmit).show();
        });

        $(".logsubmit").click(function (event) {
            var makelog = {
                method: 'POST',
                url: '/login/makelog',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: planId,
                    logtitle: $("#" + loginput).val(),
                    logfeel: $("#" + loginput1).val()
                })
            };
        
            $.ajax(makelog).then(function (responseMessage) {
                var newElement = $(responseMessage);
                if (newElement[0].status === true) {
                    $('#' + logTitle).hide();
                    $('#' + logFeel).hide();
                    $('#' + logsubmit).hide();
                    $("#" + loginput).empty();
                    $("#" + loginput1).empty();
                }
            });
        });

        $(function () {
            $(".close-sign").click(function (event) {
                event.preventDefault();
                var item = $(this).attr('id');
                $('.' + item).empty();
                $('#' + item).hide();
                $('#log' + item).hide();
                $('#logtitle' + item).hide();
                $('#logfeel' + item).hide();
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
getLog();