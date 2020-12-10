//let theButton = document.getElementById("button1");

function getData() {
    var requestConfig = {
        method: 'GET',
        url: '/login/database/password',
        contentType: 'application/json'
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        $(function() { 
            $("#loginInfo").append('<div>You have logged in the account.</div>' + newElement[0].password);
        });
    });
}

getData();

