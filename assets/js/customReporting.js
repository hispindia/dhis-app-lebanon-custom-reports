/**
 * Created by gaurav on 20-11-2014.
 */

$(document).ready(function () {


    /**
     * Get the ISO week date week number
     */
    Date.prototype.getWeek = function () {
        // Create a copy of this date object
        var target  = new Date(this.valueOf());
        // ISO week date weeks start on monday
        // so correct the day number
        var dayNr   = (this.getDay() + 6) % 7;
        // ISO 8601 states that week 1 is the week
        // with the first thursday of that year.
        // Set the target date to the thursday in the target week
        target.setDate(target.getDate() - dayNr + 3);
        // Store the millisecond value of the target date
        var firstThursday = target.valueOf();
        // Set the target to the first thursday of the year
        // First set the target to january first
        target.setMonth(0, 1);
        // Not a thursday? Correct the date to the next thursday
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        // The weeknumber is the number of weeks between the
        // first thursday of the year and the thursday in the target week
        return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
    }

    var dhisBaseURL = new String();

    $.ajaxSetup({
        async: false
    });

    jQuery.getJSON("manifest.webapp", function (json) {
        console.log(json.toString());
        dhisBaseURL = json.activities.dhis.href + "/api";
        console.log(json.activities.dhis.href + "/api");
    });

    $.ajaxSetup({
        async: true
    });

    //dhisBaseURL='http://localhost:8080/api'; //For Custom URL

    console.log('DHISBaseURL: '+dhisBaseURL);

    var reportList = new Array;


    $.ajax({
        url: dhisBaseURL+"/reports.jsonp",
        dataType: "jsonp",
        data: {
            format: "json"
        },
        success: function (response) {
            /** @namespace response.reports */
            for (var item in response.reports) {

                var report = new Object();

                report.name = response.reports[item].name;
                report.URL = response.reports[item].href;

                reportList[report.name] = report.URL;

                $('#reportSelect')
                    .append('<option id=\'' + response.reports[item].name + '\' value=\'' + response.reports[item].name + '\'>' + response.reports[item].name + '</option>');
            }
            $('#reportSelect').selectpicker({
                width: 'auto'
            });

        }
    });


    //noinspection JSUnresolvedFunction
    $('#datetimepickerStart').datetimepicker({
        pickTime: false,
        defaultDate: new Date()
    });

    //noinspection JSUnresolvedFunction
    $('#monthpickerStart').datetimepicker({
        pickTime: false,
        format: "YYYY-MM",
        viewMode: "months",
        minViewMode: "months",
        defaultDate: new Date()
    });

    //noinspection JSUnresolvedFunction
    $('#monthpickerEnd').datetimepicker({
        pickTime: false,
        format: "YYYY-MM",
        viewMode: "months",
        minViewMode: "months",
        defaultDate: new Date()
    });

    //noinspection JSUnresolvedFunction
    $('#datetimepickerEnd').datetimepicker({
        pickTime: false,
        defaultDate: new Date()
    });


    $("#datetimepickerStart").on("dp.change", function (e) {
        $('#datetimepickerEnd').data("DateTimePicker").setMinDate(e.date);
    });
    $("#datetimepickerEnd").on("dp.change", function (e) {
        $('#datetimepickerStart').data("DateTimePicker").setMaxDate(e.date);
    });

    $("#monthpickerStart").on("dp.change", function (e) {
        $('#monthpickerEnd').data("DateTimePicker").setMinDate(e.date);
    });
    $("#monthpickerEnd").on("dp.change", function (e) {
        $('#monthpickerStart').data("DateTimePicker").setMaxDate(e.date);
    });

    $("#btnHome").click(function (e) {
        var hrefURL=dhisBaseURL.substring(0,dhisBaseURL.length-3);
        window.location.href = hrefURL+'dhis-web-dashboard-integration/index.action';
    });


    $('#genButton').click(function () {

        var donorCode = $('#donorSelect').val();
        var impCode = $('#impSelect').val();

        var startDateCode = moment($('#startDate').val());
        var endDateCode = moment($('#endDate').val());

        var startMonthCode = moment($('#startMonth').val());
        var endMonthCode = moment($('#endMonth').val());

        var periodList = new String();

        if ($('#sdFormGroup').css('display') != 'none') {
            var startYear=startDateCode.format('YYYY');
            var startWeek=new Date(startDateCode).getWeek();
            //periodList = startDateCode.format('YYYYMMDD');
            periodList = startYear+'w'+startWeek;
            while (startDateCode < endDateCode) {
                startDateCode = moment(startDateCode).add(7, 'd');
                startYear = startDateCode.format('YYYY');
                startWeek = new Date(startDateCode).getWeek();
                periodList = periodList.concat(';' + startYear+'W'+startWeek);
            }
        }
        else {
            periodList = startMonthCode.format('YYYYMM');
            while (startMonthCode < endMonthCode) {
                startMonthCode = moment(startMonthCode).add(1, 'M');
                periodList = periodList.concat(';' + startMonthCode.format('YYYYMM'));
            }
        }




            console.log('periodList: ' + periodList);
            console.log('dhisBaseURL : ' + dhisBaseURL);


            sessionStorage.setItem('dhisBaseURL', dhisBaseURL);
            sessionStorage.setItem('periodList', periodList);
            sessionStorage.setItem('startDate', $('#startDate').val());
            sessionStorage.setItem('endDate', $('#endDate').val());

            var reportName = $('#reportSelect option:selected').text() + '.html';

            reportName = encodeURI(reportName);

            console.log(reportName);

            window.location.href = reportName;

    });


});
