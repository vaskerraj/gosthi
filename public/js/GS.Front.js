/**
 * Gosthi v 1.0.
 * @author Dharma Raj Bhandari
 */

$(function(){
    $.GHFront = {
        init : function() {
            var inputFocusStateSel = $('.form-control');
            $.GHFront.ppath();
            $.GHFront.inputFocusState(inputFocusStateSel);
            $.GHFront.inputMask();
            $.GHFront.flashMessageHandler();
            $.GHFront.indexPageHandler.init();
            $.GHFront.joinMeetingHandler.init();
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
        flashMessageHandler : function(){
            $collection = $("#messages");
            if(!$collection.length) return;
            setTimeout(function() {
                $("#messages").fadeOut();
            }, 4000);
        },
        indexPageHandler : {
            init : function(){
                this.singInHandler();
                this.joinMeetingHandler();
                this.meetingScrollHandler();
                this.meetingFilterHandler();
            },
            singInHandler : function(){
                var $collection = $("#signIn");
                if(!$collection.length) return;
                $collection.on('click', function(){
                    $("#signInContainer").modal('show');
                });
            },
            joinMeetingHandler : function(){
                var $collection = $("#joinMeeting");
                if(!$collection.length) return;
                $collection.on('click', function () {
                    $("#meetingRefereModal").modal('show');
                });
            },
            meetingScrollHandler : function(){
                var $collection =  $("#meeting-scroll");
                if(!$collection.length) return;
                $collection.slimscroll({
                    alwaysVisible: true,
                    height: 200,
                    size : '4px'
                });
            },
            meetingFilterHandler : function(){mettingRooms
                var $collection = $("#mettingRooms");
                if(!$collection.length) return;
                // Create the List
                var options = {
                    valueNames: ['meeting-card-title', 'date', 'meetingType']
                };
    
                // Run the list with default sort
                var mettingRooms = new List('mettingRooms', options);
                mettingRooms.sort("meeting-card-title", {
                    order: "asc"
                })
    
                // Create Filters
                $('.filter').on('click', function () {
                    var $q = $(this).attr('data-filter');
                    if ($(this).hasClass('active')) {
                    mettingRooms.filter();
                    $('#meeting-scroll').slimscroll();
                    $('.filter').removeClass('active');
                    } else {
                    $('#meeting-scroll').slimscroll();
                    mettingRooms.filter(function (item) {
                        return (item.values().meetingType == $q);
                    });
                    $('.filter').removeClass('active');
                    $(this).addClass('active');
                    }
                });
    
                // Return # of items
                var $count = $('.meeting-search-items')
                $count.append(mettingRooms.size());
                mettingRooms.on('searchComplete', function () {
                    $('#meeting-scroll').slimscroll();
                    var totalMeetingRooms = mettingRooms.update().matchingItems.length;
                    if (totalMeetingRooms === 0) {
                    $count.removeClass('d-none').html("There aren't any meetings as you search");
                    } else {
                    $count.addClass('d-none');
                    }
                });
            }
        },
        joinMeetingHandler : {
            init : function(){
                const meetingIdSearchInput = $(".input-meetingId");
                this.meetingIdSearchInput(meetingIdSearchInput);
            },
            meetingIdSearchInput : function($collection){
                if(!$collection.length) return;
                document.querySelector(".input-meetingId").addEventListener('input', function (e) {
                    e.target.value = e.target.value.replace(/[^\dA-Z]/g, '').replace(/(.{3})/g, '$1 ').trim();
                  });
            }
        }
    }
    $.GHFront.init();
});