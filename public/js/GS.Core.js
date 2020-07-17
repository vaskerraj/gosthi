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
            $.GHCore.createMeetingHandler();
            $.GHCore.remoteModalHandler();
            $.GHCore.customScrollBarOnLoadHandler();
            $.GHCore.meetingTimeHandler();
            $.GHCore.editMeetingTimeHandler()
            $.GHCore.meetingRoomHandlder();
            $.GHCore.upcomigMeetingHandler();
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
                        console.log("tbody on change");
					}
				}
			});
		},
        flashMessageHandler : function(){
            $collection = $("#messages");
            if(!$collection.length) return;
            setTimeout(function() {
                console.log("meesage hide");
                $("#messages").fadeOut();
            }, 4000);
        },
        createMeetingHandler : function(){
            const currentMeetingDate = moment().format('YYYY/MM/DD');
            document.querySelector("#meetingDate").value = currentMeetingDate;
            document.querySelector("#meetingDate").classList.add("active");
        },
        remoteModalHandler : function(){
            $('#meetingEdit_modal').on('show.bs.modal', function (e) {
                var button = $(e.relatedTarget);
                var modal = $(this);
                modal.find('.modal-body').load(button.data("remote"));
            });
            $('#userEdit_modal').on('show.bs.modal', function (e) {
                var button = $(e.relatedTarget);
                var modal = $(this);
                modal.find('.modal-body').load(button.data("remote"));
            });
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

                        var joinMeetingHref = "https://15.206.115.114/join/"+response.id;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = response.id;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-dateTime').innerHTML = meetingDateTime;
                        document.querySelector('.meeting-share-id').innerHTML = response.id;
                        
                        // 
                        document.querySelector('#inviteUser_meetingId').value = response.id;
                        document.querySelector('#inviteUser_meetingTitle').value = response.title;
                        document.querySelector('#inviteUser_meetingDate').value = meetingDateTime;
                        document.querySelector('#inviteUser_meetingLink').value = joinMeetingHref;
                        document.querySelector('.deleteMeeting').setAttribute('data-id', response.id);
                        document.querySelector('#meeting_edit').setAttribute('data-remote', '/admin/editMeeting/'+response.id);
                        
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
                    $dataSelector.find('input, select').prop('disabled', false);
                }else{
                    $dataSelector.addClass('disabled');
                    $dataSelector.find('input, select').attr('disabled', true);

                }
            });
        },
        meetingDateHandler : function(){
            var $collection = $("#meetingDate");
            $collection.datepicker({
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