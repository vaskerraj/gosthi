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
            $.GHCore.meetingRoomHandlder();
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
                        var joinMeetingHref = "https://15.206.115.114/join/"+response.id;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = response.id;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-id').innerHTML = response.id;

                        // 
                        document.querySelector('#inviteUser_meetingId').value = response.id;
                        document.querySelector('#inviteUser_meetingTitle').value = response.title;
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