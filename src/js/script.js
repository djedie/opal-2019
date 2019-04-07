(function($){
  $('.email').attr('href', atob('bWFpbHRvOndlbGNvbWVAb3BhbC5ldmVudHM='));

  $('.mobile-nav-trigger').on('click touch', function(e){
    e.preventDefault();

    if($('body').hasClass('show-mobile-nav')){
      $('body').removeClass('show-mobile-nav').css({
        'overflow' : 'visible'
      });
    } else {
      $('body').addClass('show-mobile-nav').css({
        'overflow' : 'hidden'
      });
    }
  })

  var scrollPos = {
		capability: 0,
		topPos: undefined,

		init: function(){
			var self = this;

			if(window.pageYOffset != undefined)
				self.capability = 1;
			else if(document.body && document.body.scrollTop != undefined)
				self.capability = 2;
      else if($(window).scrollTop())
        self.capability = 3;

			self.scrollCheck();

			$(window).scroll(function(){
				self.scrollCheck();
			});
		},
		scrollCheck: function(){
			var self = this;

			switch(self.capability){
				case 1 :
					self.topPos = window.pageYOffset;
					break;
				case 2 :
					self.topPos = document.body.scrollTop;
					break;
        case 3 :
					self.topPos = $(window).scrollTop();
					break;
				default :
					self.topPos = 0;
					break;
			}

			if(self.topPos > 50){
				$('body').addClass('scrolled');
			} else {
				$('body').removeClass('scrolled');
      }
		}
  };

  scrollPos.init();

  $('.popin').marypopin({
    closeSelector: '.close',
    triggers: '.popin-trigger'
  });

  var $grid = $('.grid').isotope({
    itemSelector: '.grid-item',
    percentPosition: true,
    masonry: {
      columnWidth: '.grid-sizer'
    }
  });
  // layout Isotope after each image loads
  $grid.imagesLoaded().progress( function() {
    $grid.isotope('layout');
  });
})(jQuery);
