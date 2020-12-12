var planList = $("#planList");
var planItem = $("#planItem");

planItem.hide();
$("#loginInfo").append('<div>You have logged in the account.</div>');

function getPlan() {
    var count = 0;
    var requestConfig = {
        method: 'GET',
        url: '/login/database/plans',
        contentType: 'application/json'
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        var newElement = $(responseMessage);
        //console.log(newElement);
        planList.append($("<dl>"));
        for (let i of newElement) {
            count++;
            planList.append($("<dt>" + i.nodes[0].position + "</dt>"));
            planList.append($("<dd>Arrival Time: " + i.nodes[0].arrival_time + "</dd>"));
            planList.append($("<dd>Departure Time: " + i.nodes[0].departure_time + "</dd>"));
            planList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
        }
        planList.append($("</dl>"));
        //while (count > 0) {
        $(function () {
            $(".close-sign").click(function (event) {
                event.preventDefault();
                var item = $(this).attr('id');
                console.log(item);
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
                    count--;
                    var requestConfig2 = {
                        method: 'GET',
                        url: '/login/database/plans',
                        contentType: 'application/json'
                    };
        
                    $.ajax(requestConfig2).then(function (responseMessage) {
                        var newElement = $(responseMessage);
                        planList.empty();
                        planList.append($("<dl>"));
                        for (let i of newElement) {
                            planList.append($("<dt>" + i.nodes[0].position + "</dt>"));
                            planList.append($("<dd>Arrival Time: " + i.nodes[0].arrival_time + "</dd>"));
                            planList.append($("<dd>Departure Time: " + i.nodes[0].departure_time + "</dd>"));
                            planList.append($("<button class='close-sign' id=" + i._id + ">&times</button>"));
                        }
                        planList.append($("</dl>"));
                    });
                });
            });
        
        })
    //}
});
}

getPlan();

