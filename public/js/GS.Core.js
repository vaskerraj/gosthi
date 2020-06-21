/**
 * GWTCore
 * @author Dharma Raj Bhandari
 */

(function($){
    
    $.GSCore = {
        init : function() {
            var inputFocusStateSel = $('.form-control'),
                $custommReportSelector = $('#customReport'),
                $countSecondSelector = $("#countSecondTXT");
            $.GSCore.ppath();
            $.GSCore.inputFocusState(inputFocusStateSel);
            $.GSCore.inputMask();
            $.GSCore.notifiMsgHandler();
            $.GSCore.relaodDataInSec($countSecondSelector);
            $.GSCore.datepickerHandler();
			$.GSCore.customReport($custommReportSelector);
			$.GSCore._compareReport.init();

        },
        ppath : function(){
			var pageloc = $("#pagelo").val();
			return (pageloc == "n_parent" && !undefined) ? "../" : "";
        },
        // custom floating level
        inputFocusState : function($collection){
            if(!$collection.length) return;
			$collection.each(function(){
				if( $(this).val().length > 0){
					$(this).addClass('active');
				} else {
					$(this).removeClass('active');
				}
			});
			$collection.on('focusin', function(){
				$(this).addClass("active");
				console.log($(this));
			});
			$collection.on('focusout', function(){
				if($(this).val() == ''){
					$(this).removeClass("active");
				}
			});
        },
        inputMask : function(){
            var $collection = $('[data-minput]');
            if(!$collection.length) return;
        },
        relaodDataInSec : function($collection){
            if(!$collection.length) return;
            var $dataKey = $('#deviceList'),
                counter = 2;
            setInterval(function () {
                $collection.text(counter);
                if(counter == "60") {
                    $dataKey.load(location.href +" #deviceList>*","");
                    counter = 0 ;
                }
                ++counter;
            }, 1000);
        },
        notifiMsgHandler : function(){
            var currAlertMsg = $('#currAlertMsg').val(),
            reloadAction = $('#currAlertMsg').data("reload"),
            alertAction = $('#currAlertMsg').data("paction"),
            alertRedirect = $('#currAlertMsg').data("redirect");
            if(currAlertMsg == 'success'){
                if(alertAction == 'close'){
                    setTimeout(function(){
                        window.close();
                    },4000);
                }else if(alertAction == 'popUpclose'){
                    setTimeout(function(){
                        parent.location.reload();
                    },5000);
                }else{
                    if(reloadAction == true){
                        location.href = alertRedirect;
                    }else{
                        window.history.pushState('index','title',alertRedirect);
                    }
                }
                setTimeout(function(){
                    $('.alert').fadeOut(300);
                },3500);
            }
        },
        datepickerHandler : function(){
            var $fromDateSel = $("#fromDate_report"),
                $toDateSel = $("#toDate_report");

            $fromDateSel.datepicker({
                dateFormat: "yy-mm-dd",
                changeYear: true,
                changeMonth: true,
                maxDate: 0,
                onSelect: function(dateText, inst)
                {
                    $fromDateSel.parent('div').find('label').addClass("active");
                }
            });

            $toDateSel.datepicker({
                dateFormat: "yy-mm-dd",
                changeYear: true,
                changeMonth: true,
                maxDate: 0,
                onSelect: function(dateText, inst)
                {
                    $toDateSel.parent('div').find('label').addClass("active");
                }
            });
            
        },
        
        customReport : function($collection){
            if(!$collection.length) return;
            var $dataSelector = $("#customReportSel"),
                classHide = "hide",
                $reportTableSelector = $(".reportTable_container"),
                classBtnActive = "btn-active";
            $collection.on("click", function(){
                var _this = $(this);
                _this.addClass(classBtnActive);
                $dataSelector.removeClass(classHide);
                $(".filter_container a.btn").removeClass(classBtnActive);
                if($reportTableSelector.is(":visible")){
                    $reportTableSelector.addClass(classHide);
                }
            });
        },
        _compareReport : {
			init : function(){
				let data =  {
					delRow : ".deleteCr_column",
					dataSel : "#addNewCT"
                }
                this.compareDateSelectHanlder();
				this.addCompareTimeHandler(data.dataSel);
				this.deleteCompareTimeRow(data.delRow);
            },
            timepickerHandler : function() {
                $.getScript("js/vendor/bootstrap-timepicker.min.js")
                .done(function () {
                    $('.crTime').timepicker({
                        showInputs: false,
                        showMeridian : false
                    });
                });
            },
            compareDateSelectHanlder : function(){
                var $fromDateSel = $("#crDate"),
                $toDateSel = $("#crToDate");

                $fromDateSel.datepicker({
                    dateFormat: "yy-mm-dd",
                    changeYear: true,
                    changeMonth: true,
                    maxDate: 0,
                    onSelect: function(dateText, inst)
                    {
                        console.log($(this).parent());
                        $(this).addClass("active");
                    }
                });

                $toDateSel.datepicker({
                    dateFormat: "yy-mm-dd",
                    changeYear: true,
                    changeMonth: true,
                    maxDate: 0,
                    onSelect: function(dateText, inst)
                    {
                        $(this).addClass("active");
                    }
                });
            },
			addCompareTimeHandler : function(dataSelector){
                let $self = this;
                if(!$(dataSelector).length) return;
				$(document).on('click', dataSelector, function(){
                    $self.timepickerHandler();
					let $dataItemLast = $(".col-xs-2:last"),
						appendNewRow = $('<div class="col-xs-2 marB10">'
                                        +'<span class="deleteCr_column badge label-warning cp fR"><i class="fa fa-times"></i></span>'
										+'<div class="row borderR">'
										+'<div class="col-xs-6 marT15">'
											+'<input type="text" name="crFromTime[]" class="form-controls crTime">'
											+'<span class="crFromTo_container">To</span>'
										+'</div>'
										+'<div class="col-xs-6">'
											+'<input type="text" name="crToTime[]" class="form-controls crTime">'
										+'</div>'
										+'</div>'
										+'</div>');
					$dataItemLast.after(appendNewRow);
				});
			},
			deleteCompareTimeRow : function($collection){
				var dataKeyClass = '.col-xs-2';
				$(document).on('click', $collection, function(){
					$(this).parents(dataKeyClass).remove();
					
				});
			}
		}
    }
    $.GSCore.init();

})(jQuery);