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
                
                        var joinMeetingHref = "https://15.33.33.322/join/"+response.id;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = response.id;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-id').innerHTML = response.id;
                        
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
        }

    }
    $.GHCore.init();

})(jQuery);