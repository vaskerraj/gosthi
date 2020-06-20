function doExport(selector, params) {
    var customFilename =  $('[name="filename[custom]"]').val();
    var options = {
      tableName: 'Table name',
      fileName: customFilename,
    };
    $.extend(true, options, params);

    $(selector).tableExport(options);
}

(function($){
	'use strict';
	var regForm = $("#registration_form"),
		loadingIcon = ".fa-spinner",
        checkIcon = ".fa-check",
        btnanimate = "progress-bar-striped progress-bar-active",
        btnChangePsw = $("#btn_resetUsrPsd"),
        checkSign = "<span class='glyphicon glyphicon-ok text-sucess' aria-hidden='true'></span>",
        btnPrctxt = "Processing...",
        btnCnttxt = "Continue",
        pageloc = $("#pagelo").val(),
	    ppath = (pageloc == "n_parent" && !undefined) ? "../" : "";

        function __fireCurrentTime() {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            m = checkTime(m);
            s = checkTime(s);
            $('#currentTime').html(h + " : " + m + " : " + s);
            var t = setTimeout(__fireCurrentTime, 500);
        }
        function checkTime(i) {
            if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
            return i;
        }
        function getPageName(url){
            var index = url.lastIndexOf("/") + 1,
                fileNameWithExt = url.substr(index),
                fileName = fileNameWithExt.split(".")[0];
            return fileName;
        }

        __fireConfirmPopup();
        __fireCurrentTime();

        $('[data-toggle="tooltip"]').tooltip({
            animated: 'fade',
            placement: 'top',
            right: "100px",
            html: true
        });

        $("button.close").click(function () {
            parent.$.colorbox.close();
            //parent.location.reload();
        });
        $("button.close.success").click(function () {
            parent.location.reload();
        });

        $(".collapse").on("shown.bs.collapse", function () {
            $(this).parent().find(".glyphicon-menu-down").removeClass("glyphicon-menu-down").addClass("glyphicon-menu-up");
        }).on('hidden.bs.collapse', function () {
            $(this).parent().find(".glyphicon-menu-up").removeClass("glyphicon-menu-up").addClass("glyphicon-menu-down");
        });

        //datatable
        $('[data-table="dt"').each(function(i, el){
            var that = $(el),
                thatId = $(el).attr("id"),
                $dataSearchInput  = $(that.data("dt_search")),
                $dataEntries = $(that.data("dt_entries")),
                $dataSearchSelect = $(that.data("dt_dropdown_search")),
                dataInfo =  that.data("dt_info"),
                dataInfoTxt =  that.data("dt_info_txt"),
                datadOrderCol = that.data("dt_order_column"),
                datadOrderColBy = that.data("dt_order_colum_by"),
                dataNonOrderCol = that.data("dt_nonorder_column"),
                dataUrlConnect = that.data("dt_filter_url_connect"),
                table = $("#"+thatId).DataTable({
                "sDom": 'rt<"botttom marT15"p>',
                "oLanguage": {
                    "sZeroRecords": "Sorry!!! Here is not that information you search.",
                    "sInfo": "",
                    "sInfoFiltered": "",
                    "sInfoEmpty": ""
                },
                "iDisplayLength": -1,
                "lengthChange": false,
                "autoWidth": false,
                'paging'   : true,
                "columnDefs" : [{
                    "targets": [dataNonOrderCol],
                    "orderable" : false
                }],
                "aaSorting": [[datadOrderCol, datadOrderColBy]],
                "bFilter" : true,
                drawCallback: function (settings) {
                    var api = this.api(),
                      info = api.page.info();
      
                    $(dataInfo).html(
                      'Showing <b>' + (info.start + 1) + '</b> to <b>' + info.end + '</b> of <b>' + info.recordsTotal + '</b> '+ dataInfoTxt
                    );
                  }
            });
            $dataSearchInput.on('keyup', function () {
                table.search(this.value).draw(true);
            });
            $dataEntries.on('change', function () {
                var val = $(this).val();
                table.page.len(val).draw('page');
            });
            $dataSearchSelect.on('change', function () {
                var tableData = table.column(4).data().filter( function(value, index){
                    return (value == 'Overdue') ? true : false;
                }).length;
                //$("#dataDueAmount").text(tableData);
                $("#"+thatId).dataTable().fnFilter(this.value, 4, false, false);
            });
            if(dataUrlConnect == true){
                var type_urlConnect = $('[name="urlConnect_type"]').val(),
                    typeDlt_urlConnect = $('[name="urlConnect_typeDlt"]').val();
                if(type_urlConnect == 'offPur'){
                    that.removeClass("hide");
                    datatableOffDtFn(typeDlt_urlConnect, table);
                }else{
                    that.removeClass("hide");
                }
            }else{
                that.removeClass("hide");
            }
        });

        var pageBaseUrl = getPageName(location.href);
        if(pageBaseUrl == 'viewGraph' || pageBaseUrl == ''){    
            var $deviceId = $("#iotDevice").val();       
            // _fireEnvTempHumMulti($deviceId);
            //_fireSoilTempHumMulti();
        }else if(pageBaseUrl == 'compareReport'){
            $("#btn_getReport").on('click',function(){
                // _fireCompareReport();
            });
           // _fireSlTempHumChart();
        }

        function deleteUser(el, id){
            $.get('/../admin/deleteUser/'+id,
            function(data){
                if(data == 'done'){
                    el.parents("tr").fadeOut();
                }
            });
        }

        function __fireConfirmPopup(){
            var confirmeds = false;
            $('[data-confirm]').on('click',function(){
                var that = $(this),
                    cMsg = that.attr('data-confirm-msg'),
                    cFunction = that.attr('data-confirm-function'),
                    thatId = that.attr('data-id');
                $.confirm({
                        icon: 'fa fa-smile-o',
                        theme: 'modern',
                        closeIcon: true,
                        animation: 'scale',
                        type: 'blue',
                        title: 'Confirm!',
                        content: cMsg,
                        buttons: {
                            No: function () {
                            return;
                            },
                            Yes: function () {
                            confirmeds = true;
                                if(cFunction == 'deleteUser'){
                                    deleteUser(that,thatId);
                                }else if(cFunction == 'deleteOperator'){
                                    deleteOperator(that,thatId);
                                }
                            }
                        }
                });
            });
        }
        
        $("#editSpotName_form").validate({
            errorElement: 'span',
            errorClass: 'error',
            rules : {
                spotName : {
                    required : true,
                    remote: {
                        url: "../ajax/checkSpotName.php",
                        type: "post",
                        data:
                        {
                            id: function () {
                                $(".checking_spot"+loadingIcon).show();
                                $(".checking_spot"+checkIcon).hide();
                                return $("#deviceId").val();
                            },
                            spotName: function () {
                                return $("#spotName").val();
                            }
                        },
                        complete: function (respone) {
                            $(".checking_spot"+loadingIcon).hide();
                            console.log(respone.responseText);
                            if (respone.responseText == "true") {
                                $(".checking_spot"+checkIcon).show().addClass("text-success");
                            }
                        }
                    }
                }
            },
            messages : {
                spotName: {
                    required : function(){
                        if(!$("#spotName").val().length)$(".checking_spot"+checkIcon).hide();
                        return "Provide"
                    },
                    remote: "Spot's name already used!!"
                }
            }
        });


	$("#resetUsrPsw-form").validate({
        
        errorElement: 'span',
        errorClass: 'error',
        rules: {
            currPsw_psw: {
                required: true,
                minlength: 5,
                remote: {
                    url: "ajax/checkLoginPwd.php",
                    type: "post",
                    data:
                    {
                        email: function () {
                            $("#resetUsrPsw").find(loadingIcon).show();
                            $("#resetUsrPsw").find(checkIcon).hide();
                            return $("#loginId").val();
                        },
                        enteredPsw: function () {
                            return $("#currPsw_psw").val();
                        }
                    },
                    complete: function (respone) {
                        $("#resetUsrPsw").find(loadingIcon).hide();
                        if (respone.responseText == "true") {
                            $("#resetUsrPsw").find(checkIcon).show().addClass("text-success");
                        }
                    }
                }
            },
            resetNewpsw: {
                required: true,
                minlength: 5
            },
            resetCnewpsw: {
                required: true,
                equalTo: "#resetNewpsw"
            }
        },
        messages: {
            currPsw_psw: {
                required: "Provide current password",
                minlength: "Password must be at least 5 characters",
                remote: "Invalid Password"
            },
            resetNewpsw: {
                required: "Please enter new password",
                minlength: "Password must be at least 5 characters"
            },
            resetCnewpsw: {
                required: "Please confirm new password",
                equalTo: "Password doesn't match"
            }
        },
        submitHandler: function (form) {
            $("#resetUsrPsw.modal").attr("data-backdrop", "static");
            var chePsw_currEmail = $("#loginId").val(),
            chpsw_newPsw = $("#resetCnewpsw").val(),
            chePsw_oldPsw = $("#currPsw_psw").val();

            btnChangePsw.html(btnPrctxt).attr('disabled', true).addClass(btnanimate);
            $.post("ajax/updLoginPwd.php", { userEmail: chePsw_currEmail, currPsw: chePsw_oldPsw, newPsw: chpsw_newPsw },
			function (data) {
				console.log(data);
			    if (data == 'valid') {
			        btnChangePsw.html(btnCnttxt).attr('disabled', false).removeClass(btnanimate);
			        $("#restPsw_msgs").html("<div class='alert alert-success padd4' role='alert'>" + checkSign + " Sucessfully Reset. Use New Password On Next Login</div>");
			        window.setTimeout(function () { location.reload(true) }, 4000);
			    }
			    else if (data == 'invalidd') {
			        $("#restPsw_msgs").html("<div class='alert alert-warning padd4' role='alert'>" + checkSign + " Some problem occurs.Please try again.</div>");
			        btnChangePsw.html("RESET").attr('disabled', false).removeClass(btnanimate);
			    }
			    else if (data == 'invalid') {
					alert("You try some harmful activities!!!");
					location.reload(true);
			    }
			});
            return false;
        }
    });

    
    $(".graphFrame").colorbox({ iframe: true, innerWidth: "992px", innerHeight: "580px", opacity: 0.9});
    
    $(".iframe-common").colorbox({ iframe: true, innerWidth : function(){ return $(this).attr("data-width")}, innerHeight : function(){ return $(this).attr("data-height")}, opacity: 0.9,});
    
    function getGuageSensorData(sType){
        $.post("ajax/tempHumData.php",
            function(response){
                var $responses =  $.parseJSON(response),
                    temp = $responses['env_temp'],
                    humidity = $responses['humidity'];
                if(sType == "temp"){
                    return temp;
                }else if(sType == "humidity"){
                    return humidity;
                }else{
                    return humidity;
                }
            });
        return "76";
    }
    function fireLocationPieChart(location){
        var freqLocationArray = location;
        console.log(freqLocationArray);
        if((location == undefined || location == '')){
            $("#freqLocation_pie").html("<div class='txt-gray'>Nothing to display</div>").css({
                "padding-top": "60px",
                "text-align": "center"
            });
        }else{
            $("#freqLocation_pie").css({"padding-top": "0px","text-align": "center"});
            var chart = '';
            var options = {
                chart: {
                    renderTo: 'freqLocation_pie',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    formatter: function() {
                        return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            connectorColor: '#000000',
                            formatter: function() {
                                return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '',
                    data: [],
                    size: '100%',
                    innerSize: '80%',
                    colors: ['#3da07b', 'rgba(206, 67, 0, 0.5)'],
                    showInLegend:true,
                    dataLabels: {
                        enabled: false
                    }
                }]
            }
        
            chart = new Highcharts.Chart(options);
            chart.series[0].setData(eval('['+freqLocationArray+']'));
        }
    }
    
    function _fireEnvTempHumMulti(id){

        // Create the chart
        var chart = Highcharts.StockChart('tempHumGraph', {
            chart: {
                events: {
                    load: envTempHumGraph
                }
            },

            time: {
                useUTC: false
            },
            credits : {
                enabled : false
            },
            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'minute',
                    text: '1M'
                }, {
                    count: 5,
                    type: 'minute',
                    text: '5M'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                inputEnabled: false,
                selected: 2
            },

            title: null,
            xAxis: {
                type: 'datetime',
                },
            
            yAxis: [{
                labels: {
                    format: '{value} C'
                },
                title: {
                    text: 'Temperature'
                },
                offset:45
            }, {
                labels: {
                    format: '{value}%'
                },
                title: {
                    text: 'Humidity'
                },
                opposite: false,
            }],
            exporting: {
                enabled: false
            },

            series: [{
                name: 'Temperature',
                data: [],
                yAxis: 0
            }, {
                name: 'Humidity',
                data: [],
                yAxis: 1
            }]
        });
        function envTempHumGraph() {
            function temHumGraphCore(){
                $.post("../ajax/tempHumData.php", { id : id },
                function(response){
                    console.log(response);
                    var $responses =  $.parseJSON(response),
                        temp = parseFloat($responses['temp']),
                        hum = parseFloat($responses['humidity']),
                        datetime = $responses['time'];
                    chart.series[0].addPoint({ x: (datetime), y: temp });
                    chart.series[1].addPoint({ x: (datetime), y: hum });
                });
            }
            setInterval(function () {
                temHumGraphCore();
            }, 11000);
            
            temHumGraphCore();
        }

        var customGraphOptions = {
            chart: {
                renderTo: ' ',
                type: 'spline',
            },
            time: {
                useUTC: false
            },
            credits : {
                enabled : false
            },
            rangeSelector: {
                buttons: [{
                    count: 1,
                    type: 'day',
                    text: 'TD'
                }, {
                    count: 1,
                    type: 'month',
                    text: '1mnt'
                }, {
                    count: 3,
                    type: 'month',
                    text: '3mnt'
                }, {
                    count: 6,
                    type: 'month',
                    text: '6mnt'
                }, {
                    count: 1,
                    type: 'year',
                    text: '1Y'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                selected: 7
            },

            title: null,
            xAxis: {
                type: 'datetime',
                },
            
            yAxis: [{
                labels: {
                    format: '{value} C'
                },
                title: {
                    text: 'Temperature'
                },
                offset:45
            }, {
                labels: {
                    format: '{value}%'
                },
                title: {
                    text: 'Humidity'
                },
                opposite: false,
            }],
            exporting: {
                enabled: false
            },

            series: [{
                name: 'Temperature',
                data: [],
                yAxis: 0
            }, {
                name: 'Humidity',
                data: [],
                yAxis: 1
            }]
        }

        function tempHumCusGraph() {
            $.post("../ajax/tempHumCustomData.php", { id : id },
                function(response){
                    var $responses =  $.parseJSON(response);
                    var temp = [];
                    var humidity = [];
                    $.each($responses, function(key,value) {
                        temp.push([value.time, parseFloat(value.temp)]);
                        humidity.push([value.time,parseFloat(value.humidity)]);
                    });
                    customGraphOptions.series[0].data = temp;
                    customGraphOptions.series[1].data = humidity;
                    new Highcharts.StockChart(customGraphOptions);
            });
        }
        tempHumCusGraph();
    }

    function _fireCompareReport(){
        var seriesOptions = [],
		yAxisOptions = [],
		seriesCounter = 0,
		counts = ['1', '2', '3'],
		colors = Highcharts.getOptions().colors;
	$.each(counts, function(i, count) {
        var crDate = $("#crDate").val(),
            fromDateTime = $("#crFrom_"+count).val(),
            toDateTime = $("#crTo_"+count).val();
        console.log(crDate);
		$.getJSON('ajax/testHigh.php?date='+crDate+'&fromTime='+fromDateTime+'&toTime='+toDateTime+'', function(data) {
            console.log(data);
			seriesOptions[i] = {
				name: name,
				data: data
			};
			// As we're loading the data asynchronously, we don't know what order it will arrive. So
			// we keep a counter and create the chart when all the data is loaded.
			seriesCounter++;
			if (seriesCounter == names.length) {
				createChart();
			}
		});
	});
	// create the chart when all data is loaded
	function createChart() {
		chart = new Highcharts.StockChart({
		    chart: {
		        renderTo: 'container'
		    },
		    rangeSelector: {
		        selected: 4
		    },
		    yAxis: {
		    	labels: {
		    		formatter: function() {
		    			return (this.value > 0 ? '+' : '') + this.value + '%';
		    		}
		    	},
		    	plotLines: [{
		    		value: 0,
		    		width: 2,
		    		color: 'silver'
		    	}]
		    },
		    
		    plotOptions: {
		    	series: {
		    		compare: 'percent'
		    	}
		    },
		    
		    tooltip: {
		    	pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
		    	valueDecimals: 2
		    },
		    
		    series: seriesOptions
		});
	}
    }

})(jQuery);