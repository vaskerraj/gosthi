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
            var $collection = $(".meeting-card");
            $collection.on('click', function(){
                var _this = $(this),
                    thisId = $(this).data('id');
                $collection.removeClass('active');
                _this.addClass('active');

                if(thisId){
                    $.post('/../admin/meetingDetails', {id : thisId},function(response){
                        console.log(response);
                        var joinMeetingHref = "http://localhost:3000/join/"+response.id;
                        document.querySelector('.meeting-details-title').innerHTML = response.title;
                        document.querySelector('.meeting-details-id').innerHTML = response.id;
                        document.querySelector('.meeting-share-href').innerHTML = joinMeetingHref;
                        document.querySelector('.meeting-share-href').href = joinMeetingHref;
                        document.querySelector('.meeting-share-title').innerHTML = response.title;
                        document.querySelector('.meeting-share-id').innerHTML = response.id;
                    });
                }else{

                }

                // loader
                

            });
        }
    }
    $.GHCore.init();

})(jQuery);