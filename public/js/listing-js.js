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
        function deleteMeeting(el, id){
            $.get('/../admin/deleteMeeting/'+id,
            function(data){
                if(data == 'done'){
                    location.reload(true);
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
                            }else if(cFunction == 'deleteMeeting'){
                                deleteMeeting(that,thatId);
                            }
                        }
                    }
            });
        });
    }
    
    $("#form_createMeeting").validate({
        errorElement: 'span',
        errorClass: 'error',
        rules : {
            meetingTitle : {
                required : true
            },
            meetingType : {
                required : true
            },
            meetingDate : {
                required : true,
            },
            meetingTime : {
                required : true,
            },
            meetingDuration : {
                required : true,
            }
        },
        messages : {
            meetingTitle : {
                required : "Provide"
            },
            meetingType: {
                required : "Provide"
            },
            meetingDate : {
                required : "Provide"
            },
            meetingTime : {
                required : "Provide"
            },
            meetingDuration : {
                required : "Provide"
            }
        },
        errorPlacement : function(error, element){
			if(element.attr("name") == "meetingType"){
				error.appendTo(".meetingType_error");
			}else{
				error.insertAfter(element)
			}
		}
    });

    $("#form_addUsers").validate({
        errorElement: 'span',
        errorClass: 'error',
        rules : {
            first_name : {
                required : true
            },
            last_name : {
                required : true
            },
            email : {
                required : true,
                remote: {
                    url: "/../admin/checkUserEmail",
                    type: "post",
                    data:
                    {
                        email: function () {
                            $(".checking_email"+loadingIcon).show();
                            $(".checking_email"+checkIcon).hide();
                            return $("#email").val();
                        }
                    },
                    complete: function (respone) {
                        $(".checking_email"+loadingIcon).hide();
                        console.log(respone.responseText);
                        if (respone.responseText == "true") {
                            $(".checking_email"+checkIcon).show().addClass("text-success");
                        }
                    }
                }
            },
            password : {
                required : true,
                length : 4
            }
        },
        messages : {
            first_name : {
                required : "Provide"
            },
            last_name : {
                required : "Provide"
            },
            email: {
                required : function(){
                    if(!$("#email").val().length)$(".checking_email"+checkIcon).hide();
                    return "Provide"
                },
                remote: "Email address already used !!!"
            },
            password : {
                required : "Provide",
                minlength : "Password must be atleast 4 character"
            }
        }
    });

    $("#form_editUsers").validate({
        errorElement: 'span',
        errorClass: 'error',
        rules : {
            first_name : {
                required : true
            },
            last_name : {
                required : true
            },
            email : {
                required : true,
                remote: {
                    url: "/../admin/checkUserEmail",
                    type: "post",
                    data:
                    {
                        email: function () {
                            $(".checking_email"+loadingIcon).show();
                            $(".checking_email"+checkIcon).hide();
                            return $("#email").val();
                        }
                    },
                    complete: function (respone) {
                        $(".checking_email"+loadingIcon).hide();
                        console.log(respone.responseText);
                        if (respone.responseText == "true") {
                            $(".checking_email"+checkIcon).show().addClass("text-success");
                        }
                    }
                }
            },
            password : {
                required : true,
                length : 4
            }
        },
        messages : {
            first_name : {
                required : "Provide"
            },
            last_name : {
                required : "Provide"
            },
            email: {
                required : function(){
                    if(!$("#email").val().length)$(".checking_email"+checkIcon).hide();
                    return "Provide"
                },
                remote: "Email address already used !!!"
            },
            password : {
                required : "Provide",
                minlength : "Password must be atleast 4 character"
            }
        }
    });

})(jQuery);