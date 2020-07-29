/**
 * GosthiCore
 * @author Dharma Raj Bhandari
 */

(function($){
    
    $.GHCore = {
        init : function() {
            var inputFocusStateSel = $('.form-control'),
				$applistDTtable = $("#inviteUserslist"),
				$applistDTtableCheckAll = $("#dt_checkAll");
            $.GHCore.ppath();
            $.GHCore.inputFocusState(inputFocusStateSel);
            $.GHCore.inputMask();
            $.GHCore.DTselectAll($applistDTtableCheckAll,$applistDTtable);
            $.GHCore.flashMessageHandler();
            $.GHCore.instatMeetingHandler.init();
            $.GHCore.meetingActivNavHandler();
            $.GHCore.createMeetingHandler();
            $.GHCore.remoteModalHandler.init();
            $.GHCore.customScrollBarOnLoadHandler();
            $.GHCore.meetingTimeHandler();
            $.GHCore.editMeetingTimeHandler()
            $.GHCore.meetingRoomHandlder();
            $.GHCore.upcomigMeetingHandler.init();
            $.GHCore.meetingTypeHandler();
            $.GHCore.meetingDateHandler();
            $.GHCore.inviteUserHandler.init();
            $.GHCore.upadteUsersHandler();
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
        DTselectAll : function (selectallcontrol, target) {
            if (!selectallcontrol.length || !target.length) return;
			$(selectallcontrol).on('click', function () {
				var rows = target.DataTable().rows({'search': 'applied'}).nodes();
                $('input[type="checkbox"]', rows).not(".switch input").prop('checked', this.checked);
                $.GHCore.inviteUserHandler.init();
			});
	  
			$(target).find('tbody').on('change', 'input[type="checkbox"]', function () {
                if (!this.checked) {
                    var el = $(selectallcontrol).get(0);
					if (el && el.checked && ('indeterminate' in el)) {
                        el.indeterminate = true;
					}
				}
			});
		},
        flashMessageHandler : function(){
            $collection = $("#messages");
            if(!$collection.length) return;
            setTimeout(function() {
                $("#messages").fadeOut();
            }, 4000);
        },
        instatMeetingHandler : {
            init : function(){
                const startInstantMeetBtn = $("#startInstantMeeting");
                this.startInstantMeet(startInstantMeetBtn);
                this.joinInstantMeet();
                this.endInstantMeet();
            },
            startInstantMeetData : function(id, pwd){
                var $instantMeetingStart = $("#instantMeetingStart"),
                    $instantMeetingDetail = $("#instantMeetingDetails"),
                    $instantMeetingPwdSel = $("#instantMeetingPwd_txt"),
                    $meetingEndSel = $("#meeting_end");

                $.post('/../admin/instantMeeting', { id : id, mpwd : pwd },
                function(response){
                    console.log(response);
                    if(response.id === undefined){
                        location.reload(true);
                        return false;
                    }
                    if(response.meetingPwd === null){
                        var meetingPassword = "";
                        $instantMeetingPwdSel.addClass("d-none");
                    }else{
                        var meetingPassword = response.meetingPwd;
                        $instantMeetingPwdSel.removeClass("d-none");
                    }
                    var splitMeetingId = (response.meetingId).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    const instantMeetingHref = window.location.origin+"/global/"+response.meetingId;
                    document.querySelector('.instant-details-id').innerText = splitMeetingId;
                    document.querySelector('#joinInstantMeeting').href = instantMeetingHref;
                    document.querySelector('#meeting_end').setAttribute("data-id", response.id);
                    document.querySelector('.instant-share-href').innerHTML = instantMeetingHref;
                    document.querySelector('.instant-share-href').href = instantMeetingHref;
                    document.querySelector('.instant-share-id').innerHTML = splitMeetingId;
                    document.querySelector('.instant-password').innerHTML = meetingPassword;
                    
                    $instantMeetingStart.addClass("d-none");
                    $instantMeetingDetail.removeClass("d-none");
                    $meetingEndSel.addClass("d-none");

                });
            },
            startInstantMeet : function($collection){
                if(!$collection.length) return;
                var $self = this;
                $collection.on('click', function(){
                    var _this = $(this),
                        thisId = _this.data('id');
                    
                    $("#setInstantMeetingPsd").modal('show');
                    $(".modal-backdrop.in").css('opacity', '0.5');

                    $('input[name="setPwdOrNot"]').on('change', function(){
                        var thisVal = $(this).val();
                        if(thisVal === 'yes')$("#setMeetingPwd_container").removeClass('d-none');
                    });

                    $('#setInstantMeetingPsd').on('hide.bs.modal', function (e) {
        
                        var instantMeetPwd = $("#instantMeetPwd").val();
                        if(instantMeetPwd === 'undefined'){
                            $("#instantMeetingPwd").val('');
                        }else{
                            $("#instantMeetingPwd").val(instantMeetPwd);
                        }

                        var meetingPassword  = $("#instantMeetingPwd").val();
                        $self.startInstantMeetData(thisId, meetingPassword);
                    });
                });
            },
            joinInstantMeet : function(){
                $collection = $("#joinInstantMeeting");
                if(!$collection.length) return;
                $collection.on('click', function(){
                    $("#meeting_end").removeClass("d-none");
                });
            },
            endInstantMeet : function(){
                $collection = $("#meeting_end");
                if(!$collection.length) return;
                var $selector = $("#instantMeetingDetails"),
                    $parent = $("#instantMeetingStart");
                $collection.on('click', function(){
                    var thisId = $(this).data('id');
                    $.post('/../admin/endInstantMeeting', { id : thisId },
                    function(response){
                        if(response){
                            $selector.addClass("d-none");
                            $parent.removeClass("d-none");
                        }
                    });
                });
            }
        },
        meetingActivNavHandler : function(){
            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                localStorage.setItem('activeTab', $(e.target).attr('href'));
            });
            var activeTab = localStorage.getItem('activeTab');

            if(activeTab){
                if(activeTab == '#upcoming'){
                    $.GHCore.upcomigMeetingHandler.upcomingMeetingData();
                }
                $("#meeting-card-tab, .tab-content").each(function(el){
                    $(this).find("a.nav-link").removeClass("active");
                    $(this).find(".tab-pane").removeClass("active show");
                });

                $('.nav-tabs a[href="' + activeTab + '"]').addClass('active');
                $('.tab-pane'+ activeTab).addClass('active show');
            }else{
                $("#meeting-card-tab a.nav-link:first").addClass("active");
                $(".tab-content tab-pane:first").addClass("active show");
            }
        },
        createMeetingHandler : function(){
            var collection = document.querySelector("#meetingDate");
            if(collection === null) return;
            const currentMeetingDate = moment().format('YYYY/MM/DD');
            collection.value = currentMeetingDate;
            collection.classList.add("active");
        },
        remoteModalHandler : {
            init : function(){
                this.onModalShowBs();
            },
            meetingTimeSel : function(time, selectedTime){
                return time === selectedTime ? "selected" : "";
            },
            meetingDurationSel : function(duration, selectedDuration){
                return duration === selectedDuration ? "selected" : "";
            },
            onModalShowBs : function(){
                var $self = this;
                $('#meetingEdit_modal').on('hide.bs.modal', function (e) {
                    $(".editScheduleMeeting_container").addClass("d-none");
                    $("#scheduleMeetingContent").html('');
                });
                $('#meetingEdit_modal').on('show.bs.modal', function (e) {
                    var editMeetingUrl = $(e.relatedTarget).attr('href');
                    $.ajax({
                        url: editMeetingUrl,
                        success: function(response) {
                            console.log(response);
                            document.querySelector("#editMeetingId").value = response.id;
                            document.querySelector("#editMeetingType").value = response.type;
                            document.querySelector("#edit_meetingTitle").value = response.title;
                            document.querySelector("#edit_meetingTitle").classList.add('active');
                            if(response.type === 'schedule'){
                                $(".editScheduleMeeting_container").removeClass("d-none");

                                document.querySelector("#edit_meetingDate").value = response.meeting_date;
                                document.querySelector("#edit_meetingDate").classList.add("active");
                                const meetingTimeSch = response.meeting_time,
                                    meetingDurationSch = response.meeting_duration;
                                const scheduleEditMeetingContent = '<div class="col-md-5 col-sm-12 marT10">'
                                    +'<select name="edit_meetingTime" class="form-control active" id="edit_meetingTime">'
                                        +'<option '+ $self.meetingTimeSel("11:45 PM", meetingTimeSch)+'>11:45 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("12:30 AM", meetingTimeSch)+'>12:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("12:00 AM", meetingTimeSch)+'>12:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("01:00 AM", meetingTimeSch)+'>01:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("01:30 AM", meetingTimeSch)+'>01:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("02:00 AM", meetingTimeSch)+'>02:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("02:30 AM", meetingTimeSch)+'>02:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("03:00 AM", meetingTimeSch)+'>03:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("03:30 AM", meetingTimeSch)+'>03:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("04:00 AM", meetingTimeSch)+'>04:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("04:30 AM", meetingTimeSch)+'>04:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("05:00 AM", meetingTimeSch)+'>05:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("05:30 AM", meetingTimeSch)+'>05:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("06:00 AM", meetingTimeSch)+'>06:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("06:30 AM", meetingTimeSch)+'>06:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("07:00 AM", meetingTimeSch)+'>07:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("07:30 AM", meetingTimeSch)+'>07:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("08:00 AM", meetingTimeSch)+'>08:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("8:30 AM", meetingTimeSch)+'>8:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("09:00 AM", meetingTimeSch)+'>09:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("09:30 AM", meetingTimeSch)+'>09:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("10:00 AM", meetingTimeSch)+'>10:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("10:30 AM", meetingTimeSch)+'>10:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("11:00 AM", meetingTimeSch)+'>11:00 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("11:30 AM", meetingTimeSch)+'>11:30 AM</option>'
                                        +'<option '+ $self.meetingTimeSel("12:00 PM", meetingTimeSch)+'>12:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("12:30 PM", meetingTimeSch)+'>12:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("01:00 PM", meetingTimeSch)+'>01:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("01:30 PM", meetingTimeSch)+'>01:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("02:00 PM", meetingTimeSch)+'>02:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("02:30 PM", meetingTimeSch)+'>02:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("03:00 PM", meetingTimeSch)+'>03:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("03:30 PM", meetingTimeSch)+'>03:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("04:00 PM", meetingTimeSch)+'>04:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("04:30 PM", meetingTimeSch)+'>04:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("05:00 PM", meetingTimeSch)+'>05:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("05:30 PM", meetingTimeSch)+'>05:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("06:00 PM", meetingTimeSch)+'>06:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("06:30 PM", meetingTimeSch)+'>06:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("07:00 PM", meetingTimeSch)+'>07:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("07:30 PM", meetingTimeSch)+'>07:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("08:00 PM", meetingTimeSch)+'>08:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("08:30 PM", meetingTimeSch)+'>08:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("09:00 PM", meetingTimeSch)+'>09:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("09:30 PM", meetingTimeSch)+'>09:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("10:00 PM", meetingTimeSch)+'>10:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("10:30 PM", meetingTimeSch)+'>10:30 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("11:00 PM", meetingTimeSch)+'>11:00 PM</option>'
                                        +'<option '+ $self.meetingTimeSel("11:30 PM", meetingTimeSch)+'>11:30 PM</option>'
                                +'</select>'
                                +'<label for="edit_meetingTime">Time</label>'
                            +'</div>'
                            +'<div class="col-md-7 col-sm-12 marT10">'
                                +'<select name="edit_meetingDuration" class="form-control active" id="edit_meetingDuration">'
                                    +'<option value="15_minutes" '+ $self.meetingDurationSel("15_minutes", meetingDurationSch)+'>15 Min</option>'
                                    +'<option value="30_minutes" '+ $self.meetingDurationSel("30_minutes", meetingDurationSch)+'>30 Min</option>'
                                    +'<option value="45_minutes" '+ $self.meetingDurationSel("45_minutes", meetingDurationSch)+'>45 Min</option>'
                                    +'<option value="60_minutes" '+ $self.meetingDurationSel("60_minutes", meetingDurationSch)+'>60 Min</option>'
                                    +'<option value="1.5_hours" '+ $self.meetingDurationSel("1.5_hours", meetingDurationSch)+'>1.5 H</option>'
                                    +'<option value="2_hours" '+ $self.meetingDurationSel("2_hours", meetingDurationSch)+'>2 H</option>'
                                    +'<option value="2.5_hours" '+ $self.meetingDurationSel("2.5_hours", meetingDurationSch)+'>2.5 H</option>'
                                    +'<option value="3_hours" '+ $self.meetingDurationSel("3_hours", meetingDurationSch)+'>3 H</option>'
                                    +'<option value="4_hours" '+ $self.meetingDurationSel("4_hours", meetingDurationSch)+'>4 H</option>'
                                    +'<option value="5_hours" '+ $self.meetingDurationSel("5_hours", meetingDurationSch)+'>5 H</option>'
                                    +'<option value="6_hours" '+ $self.meetingDurationSel("6_hours", meetingDurationSch)+'>6 H</option>'
                                    +'<option value="7_hours" '+ $self.meetingDurationSel("7_hours", meetingDurationSch)+'>7 H</option>'
                                    +'<option value="8_hours" '+ $self.meetingDurationSel("8_hours", meetingDurationSch)+'>8 H</option>'
                                +'</select>'
                                +'<label for="edit_meetingDuration">Duration</label>'
                            +'</div>';
                                $("#scheduleMeetingContent").append(scheduleEditMeetingContent);
                                $.GHCore.editMeetingTimeHandler();
                            }
                        },
                        error:function(request) {
                            console.log("error");
                        }
                });              
                });
                $('#userEdit_modal').on('show.bs.modal', function (e) {
                    var button = $(e.relatedTarget);
                    var modal = $(this);
                    modal.find('.modal-body').load(button.data("remote"));
                });
            }
        },
        meetingScrollBarHandler : function(){
            $('.tab-scroll').slimscroll({
                alwaysVisible: true,
                height: 290,
                size : '4px'
            });
        },
        customScrollBarOnLoadHandler : function(){
            var $self = this;
            $self.meetingScrollBarHandler();
        },
        meetingTimeHandler : function(){
            $collection = document.querySelector(".meetingTime");
            $editCollection = document.querySelector("#edit_meetingTime");
            if($collection === null) return;

            // init meeting time
            var selectedMeetingTimeTxt = $collection.options[$collection.selectedIndex].value;
            document.querySelector('.meetingTimeTxt').innerText = selectedMeetingTimeTxt;

            $collection.addEventListener('change', (e)=>{
                var selectedMeetingTime = e.target.value;
                document.querySelector('.meetingTimeTxt').innerText = selectedMeetingTime;
            });
        },
        editMeetingTimeHandler : function(){
            $collection = $("#edit_meetingTime");
            if(!$collection.length) return;

            // init meeting time at edit page
            var docEditMeetingSel = document.querySelector("#edit_meetingTime");
            var edit_selectedMeetingTimeTxt = docEditMeetingSel.options[docEditMeetingSel.selectedIndex].value;
            document.querySelector('.edit_meetingTimeTxt').innerText = edit_selectedMeetingTimeTxt;

            docEditMeetingSel.addEventListener('change', (e)=>{
                var edit_selectedMeetingTime = e.target.value;
                document.querySelector('.edit_meetingTimeTxt').innerText = edit_selectedMeetingTime;
            });
        },
        meetingRoomHandlder : function(){
            var $collection = $(".meeting-card"),
                $selectedMeetingSel = $("#selectedMeeting"),
                $instantMeetingSel = $("#instantMeeting");

            if(!$collection.length) return;
            $.GHCore.meetingTimeHandler();
            $collection.on('click', function(){
                var _this = $(this),
                    thisId = $(this).data('id');
                $collection.removeClass('active');
                _this.addClass('active');

                if(thisId){
                    $.post('/../admin/meetingDetails', {id : thisId},
                    function(response){
                        if(response.id === undefined){
                            location.reload(true);
                            return false;
                        }
                        if(response.type ==  'normal'){
                            var meetingDateTime = "";
                        }else{
                            var meetingDate = moment(response.meeting_date).format('ddd, MMM DD, YYYY');
                            var meetingTime = response.meeting_time;
                            var meetingDuration = response.meeting_duration.split('_');
                           var meetingAddDuration =  moment(meetingTime, 'hh:mm A').add(meetingDuration[0], meetingDuration[1]).format('hh:mm A');
                            var meetingDateTime = meetingDate+' '+meetingTime+' - '+meetingAddDuration
                        }
                        
                        var splitMeetingId = (response.meeting_id).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                        var joinMeetingHref = window.location.origin+"/join/"+response.meeting_id;
                        document.querySelector('#startSelectedMeeting').href = joinMeetingHref;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = splitMeetingId;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-dateTime').innerHTML = meetingDateTime;
                        document.querySelector('.meeting-share-id').innerHTML = splitMeetingId;
                        
                        // 
                        document.querySelector('#inviteUser_meetingId').value = response.meeting_id;
                        document.querySelector('#inviteUser_meetingTitle').value = response.title;
                        document.querySelector('#inviteUser_meetingDate').value = meetingDateTime;
                        document.querySelector('#inviteUser_meetingLink').value = joinMeetingHref;
                        document.querySelector('.deleteMeeting').setAttribute('data-id', response.id);
                        document.querySelector('#meeting_edit').setAttribute('data-remote', '/admin/editMeeting/'+response.id);
                        document.querySelector('#meeting_edit').href = '/admin/editMeeting/'+response.id;
                        
                        $selectedMeetingSel.removeClass("d-none");
                        $instantMeetingSel.addClass("d-none");

                    });
                }else{
                    $instantMeetingSel.removeClass("d-none");
                    $selectedMeetingSel.addClass("d-none");
                }

                // loader

            });
        },
        
        dateToFromNowDaily : function( someDate ){
            // moment(someDate).fromNow(true);
            let date = moment(someDate);
            if (moment().diff(date, 'days') >= 1) {
                return date.fromNow(); // '2 days ago' etc.
            }
            return date.calendar().split(' ')[0]; // 'Today', 'yesterday', 'tomorrow'
        },

        meetingTimeMinOrHour : function($collection){
            if($collection === "minutes"){
                return "Min";
            }else{
                return "H";
            }
        },
        upcomigMeetingHandler : {
            init: function(){
                this.onUpcomingTab();
            },
            onUpcomingTab : function(){
                $collection = $("#upcoming-tab");
                if(!$collection.length) return;
                var $self = this;
                $collection.on('click', function(){
                    $self.upcomingMeetingData();
                });
            },
            upcomingMeetingData : function(){
                $("#upcomingLoader").removeClass('d-none');
                $.post('../admin/upcomingMeeting', { id: 4},
                function(data){
                    console.log(data);
                    var upcomingMeetingList =  data.map(function(item){
                        const upcoming_M_D_Format = moment(item.meeting_date).format('YYYY, MM, DD');
                        const upcomingDisplayFormat = moment(item.meeting_date).format('ddd, MMM DD');
                        const dateToFromNow = $.GHCore.dateToFromNowDaily(upcoming_M_D_Format);
                        if(dateToFromNow === 'Today' || dateToFromNow === 'Tomorrow'){
                            var upcomingMeetingDate = dateToFromNow;
                        }else{
                            var upcomingMeetingDate = upcomingDisplayFormat;
                        }

                        const upcomingMeetingDuFirst = (item.meeting_duration).split('_')[0];
                        const upcomingMeetingDuSecond = $.GHCore.meetingTimeMinOrHour((item.meeting_duration).split('_')[1]);
                        const upcomingMeetingDuration = upcomingMeetingDuFirst+' '+upcomingMeetingDuSecond;
                        const upcomingMettingitemList = '<li class="meeting-date mb-1 pt-3 fontb font18" style="font-weight:600">'+upcomingMeetingDate+'</li>'
                                        +'<li class="meeting-card upcoming" data-id="'+item.id+'">'
                                        +'<div class="row">'
                                            +'<div class="col-5 text-right pr-3">'
                                                +'<div class="meeting-card-time fontb font18">'+item.meeting_time+'</div>'
                                                +'<div class="clearfix">'+upcomingMeetingDuration+'</div>'
                                            +'</div>'
                                            +'<div class="col-7">'
                                                +'<div class="meeting-card-title d-block">'+item.title+'</div>'
                                                +'<div class="meeting-card-desc">ID : '+item.meeting_id+'</div>'
                                            +'</div>'
                                        +'</div>'
                                   +'</li>';
                        return upcomingMettingitemList;
                    });
                    
                    $("#upcomingLoader").addClass('d-none');
                    $("#upcomingMeetingList").html(upcomingMeetingList);
                    $(".tab-scroll").slimscroll();
                    $.GHCore.meetingRoomHandlder();
                });
            }
        },
        meetingTypeHandler : function(){
            $collection = $(".meetingType");
            if(!$collection.length) return;
            var $dataSelector = $(".scheduleMeeting_container");
            $collection.on('change', function(){
                var _thisVal = $(this).val();
                if(_thisVal === 'schedule'){
                    $dataSelector.removeClass('disabled');
                    $dataSelector.find('input, select').prop('disabled', false);
                }else{
                    $dataSelector.addClass('disabled');
                    $dataSelector.find('input, select').attr('disabled', true);

                }
            });
        },
        meetingDateHandler : function(){
            var $collection = $("#meetingDate");
            // if(!$collection.length) return;
            $collection.datepicker({
                dateFormat: "yy/mm/dd",
                minDate: "0",
            });
            

            $("#editMeetingHeight").val($('body').height());

            parent.$.colorbox.resize({
				innerHeight:  $('#editMeetingHeight').val()
            });

            $(".edit_meetingDate").datepicker({
                dateFormat: "yy/mm/dd",
                minDate: "0",
            });                
        },
        inviteUserHandler : {
            init : function(){
                this.onInviteUsersChange();
                this.setInviteUsers();
            },
            setInviteUsers : function(){
                var invitedEmail = [];

                var selectedUsers = document.querySelectorAll("input[name='invite_user_checkbox']:checked");
                for ( var i = 0; i < selectedUsers.length; i++ ){
                    invitedEmail.push(selectedUsers[i].value);
                }
            
                $(".inviteUsersEmail").val(invitedEmail);
            },
            onInviteUsersChange : function(){
                // scroll
                $('#inviteUser-scroll').slimscroll({
                    alwaysVisible: true,
                    height: 350
                });

                $("input[name='invite_user_checkbox']").change(function() {
                    $.GHCore.inviteUserHandler.setInviteUsers();
                });
            }
        },
        upadteUsersHandler : function(){
            var $collection = document.querySelector("#triggerUpdUserPsd");
            if($collection === null) return;
            document.querySelector("#triggerUpdUserPsd").addEventListener('change', function(e){
                
                if(this.checked){
                    document.querySelector("#user_updPass").disabled = false;
                }else{
                    document.querySelector("#user_updPass").disabled = true;
                }
            })
        }

    }
    $.GHCore.init();

})(jQuery);