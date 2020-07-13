/**
 * GosthiCore
 * @author Dharma Raj Bhandari
 */

(function($){
    
    $.GHCore = {
        init : function() {
            var inputFocusStateSel = $('.form-control');
            $.GHCore.ppath();
            $.GHCore.inputFocusState(inputFocusStateSel);
            $.GHCore.inputMask();
            $.GHCore.customScrollBarOnLoadHandler();
            $.GHCore.meetingRoomHandlder();
            $.GHCore.upcomigMeetingHandler();
            $.GHCore.meetingTypeHandler();
            $.GHCore.inviteUserHandler();
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
        meetingScrollBarHandler : function(){
            console.log("meeting scroll called");
            $('.tab-scroll').slimscroll({
                alwaysVisible: true,
                height: 290
              });
        },
        customScrollBarOnLoadHandler : function(){
            var $self = this;
            $self.meetingScrollBarHandler();
        },
        meetingRoomHandlder : function(){
            var $collection = $(".meeting-card"),
                $selectedMeetingSel = $("#selectedMeeting"),
                $instantMeetingSel = $("#instantMeeting");

            if(!$collection.length) return;

            $collection.on('click', function(){
                var _this = $(this),
                    thisId = $(this).data('id');
                $collection.removeClass('active');
                _this.addClass('active');

                if(thisId){
                    $.post('/../admin/meetingDetails', {id : thisId},
                    function(response){
                        console.log(response);
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

                        var joinMeetingHref = "https://15.206.115.114/join/"+response.id;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = response.id;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-dateTime').innerHTML = meetingDateTime;
                        document.querySelector('.meeting-share-id').innerHTML = response.id;
                        // document.querySelector('.deleteMeeting').setAttribute('data-id', response.id);

                        // 
                        document.querySelector('#inviteUser_meetingId').value = response.id;
                        document.querySelector('#inviteUser_meetingTitle').value = response.title;
                        document.querySelector('#inviteUser_meetingDate').value = meetingDateTime;
                        document.querySelector('#inviteUser_meetingLink').value = joinMeetingHref;
                        
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
        upcomigMeetingHandler : async function(){
            $collection = $("#upcoming-tab");
            if(!$collection.length) return;
            $collection.on('click', function(){
                $("#upcomingLoader").removeClass('d-none');
                $.post('../admin/upcomingMeeting', { id: 4},
                function(data){
                    var upcomingMeetingList =  data.map(function(item){
                        const upcoming_M_D_Format = moment(item.meeting_date).format('YYYY, MM, DD');
                        const upcomingDisplayFormat = moment(item.meeting_date).format('ddd, MMM DD');
                        const dateToFromNow = $.GHCore.dateToFromNowDaily(upcoming_M_D_Format);
                        if(dateToFromNow === 'Today' || dateToFromNow === 'Tomorrow'){
                            var upcomingMeetingDate = dateToFromNow;
                        }else{
                            var upcomingMeetingDate = upcomingDisplayFormat;
                        }
                        const upcomingMettingitemList = '<li class="meeting-date mb-1 pt-3 fontb font18" style="font-weight:600">'+upcomingMeetingDate+'</li>'
                                        +'<li class="meeting-card upcoming" data-id="'+item.id+'">'
                                        +'<div class="row">'
                                            +'<div class="col-5 text-right pr-3">'
                                                +'<div class="meeting-card-time fontb font18">'+item.meeting_time+'</div>'
                                                +'<div class="clearfix">'+item.meeting_duration+'</div>'
                                            +'</div>'
                                            +'<div class="col-7">'
                                                +'<div class="meeting-card-title d-block">'+item.title+'</div>'
                                                +'<div class="meeting-card-desc">ID : '+item.id+'</div>'
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
            });
        },
        meetingTypeHandler : function(){
            $collection = $(".meetingType");
            if(!$collection.length) return;
            var $dataSelector = $(".scheduleMeeting_container");
            $collection.on('change', function(){
                var _thisVal = $(this).val();
                if(_thisVal === 'schedule'){
                    $dataSelector.removeClass('disabled');
                }else{
                    $dataSelector.addClass('disabled');
                }
            });
        },
        inviteUserHandler : function(){
            var invitedEmail = [];
            $("input[name='invite_user_checkbox']").change(function() {
                var checked = $(this).val();
                if ($(this).is(':checked')) {
                    invitedEmail.push(checked);
                }else{
                    invitedEmail.splice($.inArray(checked, invitedEmail),1);
                }
                
            $(".inviteUsersEmail").val(invitedEmail);
            });
        }

    }
    $.GHCore.init();

})(jQuery);