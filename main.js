/// <reference path="jquery-3.4.1.js" />

var coinsToReport = [];
var tempArrayOfCoins = [];

// Getting information of assets stored on client-side
(() => {
    var str = localStorage.getItem("cardIdToReport");
    var tokenCheckedFromLocatlS = JSON.parse(str);

    coinsToReport = tokenCheckedFromLocatlS;
    if (tokenCheckedFromLocatlS != null) {
        for (let i = 0; i < tokenCheckedFromLocatlS.length; i++) {
            tempArrayOfCoins.push(tokenCheckedFromLocatlS[i]);
        }
    }

    if (coinsToReport == null) {
        coinsToReport = new Array();
        tempArrayOfCoins = new Array();
    }
})();

// Onload Function for show all assets
function showAll() {
    $("#loading").css("display", "block");
    getInfo()
        .then(info => displayTokens(info))
        .catch(err => alert(err));
};

// Function using "Promise", to provide info for "showAll()" function 
function getInfo() {
    return new Promise((resolve, reject) => {
        $.getJSON("https://api.coingecko.com/api/v3/coins/list", json => resolve(json))
            .fail(err => reject(err))
    });
};

// Array having all coins for search 
var allTokensForSearch = [];

//  Clear function
$("#clearButton").click(function () {
    location.reload(true);
});


//  Function for display tokens
function displayTokens(info) {
    $("container").empty();
    var temclonedTemplate = $(".cardTemplate").clone();

    temclonedTemplate.addClass("card").removeClass(".cardTemplate").css("display", "inline-block");
    for (let i = 50; i < 150; i++) {
        var div = fillTemplate(info[i]);
        temclonedTemplate.clone().html(div).css("visibility", "visible").css("background-color", "rgba(32, 68, 92, 0.74)").css("color", "white").attr("id", info[i].symbol).appendTo(".container");
        allTokensForSearch[info[i].symbol] = info[i];
    }
    addCheckBox();
    addMoreInfo();
}

// A function that fills the template
function fillTemplate(info) {
    $("#loading").css("display", "block");
    const id = "<p class=`card-title `>" + `<b>` + `id: ` + `</b>` + info.id + "</[>";
    const symbol = "<p class=`card-text`>" + `<b>` + `Symbol: ` + `</b>` + info.symbol + "</p>";
    const moreInfo = "<button  data-target=#" + info.id + " data-toggle=\"collapse\" class=\"btn btn-primary moreInfoButton\" data-cardid=" + info.id + ">More Info</button>";
    const togleButton = "<input type=\"checkbox\" class=\"toggle-s checkBoxToken\" data-cardid=" + info.symbol + "   data-toggle=\"toggle\"></input>";
    const buttonCheckBoxWrapper = "<div class=\"col-xs-4 \">" + moreInfo + togleButton + "</div>";
    return "<div  class=\"card-body\  col-xs-12 " + info.id + " \">" + id + symbol + buttonCheckBoxWrapper + "</div>";
}


// Function for adding checkbox
function addCheckBox() {
    $("#loading").css("display", "none");
    $(".toggle-s").bind('click', onSwitchCkliked);
    coinsToReport.forEach(cardid => {
        var checkboxToCheck = $('.toggle-s[data-cardid=\"' + cardid + '"]');
        checkboxToCheck.attr('checked', 'checked')
    });
}


// Function for adding more info 
function addMoreInfo() {
    $(".moreInfoButton").click(function () {
        getMoreInfo($(this).data("cardid"));
    });
}


// Function for getting more info
function getMoreInfo(cardId) {
    var dt = (new Date()).valueOf();
    var localStorageIsEmty = true;
    var str = localStorage.getItem(cardId);
    var cardFromLocal = JSON.parse(str);
    var localStorageIsEmptyORDeffirenceIsMoreThanTwoMinutes = (cardFromLocal === null) || (dt - cardFromLocal.timestamp) > (1000 * 60 * 2);

    if (localStorageIsEmptyORDeffirenceIsMoreThanTwoMinutes) {
        console.log(cardId);
        $("#loading").css("display", "block");
        exchengeItemRequest("https://api.coingecko.com/api/v3/coins/" + cardId)
            .then(moreInfo => onMoreInfoRequestSuccess(moreInfo))
            .catch(err => alert(err))
    } else {
        onMoreInfoRequestSuccess(cardFromLocal.data);
    }
};


// function to show more info in case when local storage is empty or last updated time is more than 2 minutes
function onMoreInfoRequestSuccess(json) {
    console.log(json)
    const id = json.id;
    const childId = id;
    var parentDiv = $(`.${json.id}`);
    let childDiv = document.getElementById("#" + childId);
    // console.log(childDiv);

    $("#loading").css("display", "none");
    if (childDiv != null) {
        childDiv.remove();
    } else {
        const rateUSD = "<p3>" + json.market_data.current_price.usd + " $" + "</p3><br>"
        const rateEUR = "<p4>" + json.market_data.current_price.eur + " €" + "</p4><br>";
        const rateILS = "<p5>" + json.market_data.current_price.ils + " ₪" + "</p5><br>";
        const img = "<img src=" + json.image.small + " class=\"logoOfToken\"></img>";
        const divOfMoreInfo = "<div class=\"col-xs-8 \" id=" + childId + ">" + rateUSD + rateEUR + rateILS + img + "</div>";

        json["lastUpdatedTime"] = new Date();
        localStorage.setItem(json.id, JSON.stringify({
            timestamp: (new Date()).valueOf(),
            data: json
        }));
        parentDiv.append((divOfMoreInfo));
    }
}


// Function for getting more info in case when local storage is empty or last updated time is more than 2 minutes.
function exchengeItemRequest(url) {
    return new Promise((resolveM, rejectM) => {
        $.getJSON(url, moreInfo => resolveM(moreInfo))
            .fail(err => rejectM(err));
    });
}


// Search function - 
$("#searchButton").click(function () {
    const searchValue = $("#inputBoxOfSearch").val();
    var dt = new Date();

    //Validation
    if (searchValue == "") {
        alert("please enter value");
        return;
    }

    if (allTokensForSearch[searchValue] !== undefined) {
        $("#about,#liveReports").css("display", "none");
        $("#divTokens").css("display", "inline-block");
        $(".cardTemplate").css("display", "none");
        $(`#${searchValue}`).css("display", "inline-block");

    } else {
        alert("Nothing found!");
    }
});
//  end of search  function


// functionality of checkbox
function onSwitchCkliked(event) {
    var chk = this;
    var cardId = $(chk).data("cardid");

    if (chk.checked === true) {

        if (coinsToReport.length > 4) {
            showChoosingCoinsPopup();
            return false;
        }

        coinsToReport.push(cardId);
        localStorage.setItem("cardIdToReport", JSON.stringify(coinsToReport));

    } else {

        for (let i = 0; i < coinsToReport.length; i++) {
            if (coinsToReport[i] === cardId) {
                coinsToReport.splice(i, 1);
                localStorage.setItem('cardIdToReport', JSON.stringify(coinsToReport));
                return;
            }
        }
    }
}


// Function of displaying modal of assets to choose 
function showChoosingCoinsPopup() {
    tempArrayOfCoins = coinsToReport;
    alert("There is more than 5 tokens for report");
    $(".modal-content").empty();

    for (let i = 0; i < coinsToReport.length; i++) {
        var checkBoxId = coinsToReport[i] + "_m";
        $(".modal-content").append("<div><p>" +
            coinsToReport[i] +
            "<input id=\"" + checkBoxId + "\" type=\"checkbox\" class=\"toggle-s checkBoxModal\"  data-toggle=\"toggle\" checked=\"checked\"></input></p></div>"
        );

        $("#" + checkBoxId).on('change', function () {
            if (this.checked) {
                var idToPush = this.id.replace("_m", "");
                coinsToReport.push(idToPush);
                var chckBoxTocheck = $("[data-cardid=\"" + idToPush + "\"]");

                chckBoxTocheck.prop("checked", true);
                localStorage.setItem("cardIdToReport", JSON.stringify(coinsToReport));

            } else {

                var idToDel = this.id.replace("_m", "");
                var chckBoxToUncheck = $("[data-cardid=\"" + idToDel + "\"]");
                var index = coinsToReport.indexOf(idToDel);
                if (index !== -1) coinsToReport.splice(index, 1);
                chckBoxToUncheck.prop("checked", false);
                localStorage.setItem("cardIdToReport", JSON.stringify(coinsToReport));
            }
        });
    }
    $('.modal').modal('show');
}

// Single Page settings
// Function shows the home page "divTokens" and hides pages "Live reports" and "About"
function showHome() {
    location.reload(true);
}

// Function shows the page "Live reports" and hides pages"Home" and "About"
function showliveReports() {
    $("#divTokens,#about").css("display", "none");
    $("#liveReports").css("display", "inline-block");
    showCharts();
}

// Function shows the page"About" and hides pages "Home"and "Live reports"
function showAbout() {
    $("#divTokens,#liveReports").css("display", "none");
    $("#about").css("display", "inline-block");
}
// End of single page settings


//  transform for Header
var textWrapper = document.querySelector('.ml14 .letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>");

anime.timeline({
        loop: true
    })
    .add({
        targets: '.ml14 .line',
        scaleX: [0, 1],
        opacity: [0.5, 1],
        easing: "easeInOutExpo",
        duration: 900
    }).add({
        targets: '.ml14 .letter',
        opacity: [0, 1],
        translateX: [40, 0],
        translateZ: 0,
        scaleX: [0.3, 1],
        easing: "easeOutExpo",
        duration: 800,
        offset: '-=600',
        delay: function (el, i) {
            return 150 + 25 * i;
        }
    }).add({
        targets: '.ml14',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
    });
//   End of transform for header

// chart data
let chartIntervalTimer = null;
let chartIntervalValue = 2000;
let time = new Date;
let dataPoints = [];
let dataPoints1 = [];
let dataPoints2 = [];
let dataPoints3 = [];
let dataPoints4 = [];
let dataPoints5 = [];

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
}
// function  for start of updating chart
function start() {
    chartIntervalTimer = setInterval(updateChart, chartIntervalValue);
};


// function displaying chart
function showCharts() {

    let cardIdToReport = localStorage.getItem("cardIdToReport");

    if (cardIdToReport && cardIdToReport.length) {
        $("#loading").css("display", "block");
        cardIdToReport = cardIdToReport.toUpperCase();
        cardIdToReport = cardIdToReport.replace(/"/g, '');
        cardIdToReport = cardIdToReport.replace(/[\[\]']+/g, "");
        cardIdToReportString = cardIdToReport;
        cardIdToReport = cardIdToReport.split(",");

        let url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + cardIdToReport + "&tsyms=USD";
        $.getJSON(url, function (data) {
            let arr = Object.entries(data).map(([k, v]) => ([k, v]));
            for (let i = 0; i < arr.length; i++) {
                if (arr[i][1].USD == undefined) {
                    alert("At this moment rate of " + cardIdToReport + " coin is non available");
                    location.reload(true);
                    break;
                }
                dataPoints = dataPoints || [];
                dataPoints.push({
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "###.###",
                    xValueFormatString: "hh:mm:ss TT",
                    showInLegend: true,
                    name: arr[i][0],
                    dataPoints: [{
                        x: time.getTime(),
                        y: arr[i][1].USD
                    }]
                });
            }
            let options = {
                title: {
                    text: cardIdToReportString
                },
                axisX: {
                    title: "chart updates every 2 secs"
                },
                axisY: {
                    suffix: "USD",
                    includeZero: true
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    verticalAlign: "top",
                    fontSize: 22,
                    fontColor: "darck",
                    itemclick: toggleDataSeries
                },
                data: dataPoints
            };
            if (dataPoints.length) {
                let chart = $("#chartContainer").CanvasJSChart(options);
                start();
            }
            $("#loading").css("display", "none");
        });

    } else {
        $("#noAssetsSelected").css("display", "inline-block");
    }

    $('#chartContainer').attr('hidden', false);
    $('#container').attr('hidden', true);
}

// function of updating chart
function updateChart() {
    let cardIdToReport = localStorage.getItem("cardIdToReport");
    if (cardIdToReport && cardIdToReport.length) {
        cardIdToReport = cardIdToReport.toUpperCase();
        cardIdToReport = cardIdToReport.replace(/"/g, '');
        cardIdToReport = cardIdToReport.replace(/[\[\]']+/g, "");

    } else return;

    let url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + cardIdToReport + "&tsyms=USD";
    $.getJSON(url, function (data) {
        time.setTime(time.getTime() + chartIntervalValue);

        let arr = Object.entries(data).map(([k, v]) => ([k, v]));
        for (let i = 0; i < arr.length; i++) {
            for (j = 0; j < dataPoints.length; j++) {
                if (dataPoints[j]['name'] === arr[i][0]) {
                    dataPoints[j]['dataPoints'].push({
                        x: time.getTime(),
                        y: arr[i][1].USD
                    });
                    arr[i] = [];
                }
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length)
                dataPoints.push({
                    type: "line",
                    xValueType: "dateTime",
                    yValueFormatString: "###.###",
                    xValueFormatString: "hh:mm:ss TT",
                    showInLegend: true,
                    name: arr[i][0],
                    dataPoints: [{
                        x: time.getTime(),
                        y: arr[i][1].USD
                    }]
                });
        }
        $("#chartContainer").CanvasJSChart().render();
    });
}