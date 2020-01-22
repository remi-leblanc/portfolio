$(document).ready(function(){

	
	///////////////////////////////////
	// VARS INIT
	///////////////////////////////////

	//Parameters
	var maxLoop = 3;

	//Global vars
	var pageCenter = $(window).width() / 2;
	var redbarWidth = $('.redbar').width();
	var originMouseX = null;
	var mouseX = 0;
	var mouseY = 0;
	var mouseOverlayWidth = $('.mouse').width();
	var mouseOverlayHeight = $('.mouse').height();
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var loading = true;
	var globalMouseDown = false;
	var mouseOverState = false;
	var mouseOverTarget = null;
	var touchDevice = $('html').hasClass('mod_touchevents');
	var borderSize = $('header').outerWidth() - $('header').width();

	//Nav vars
	var navItems = $('.nav-item');
	var selectedItem = $('.nav-item.selected');
	var selectedPos = selectedItem.offset().left + (selectedItem.outerWidth() / 2);
	var selectedProject = $('.nav-item.selected').attr('data-project');
	var navItemsWidth = 0;
	var currTranslation = 0;
	var onDownNavTranslation = null;
	

	///////////////////////////////////
	// GLOBAL FUNCTIONS
	///////////////////////////////////

	function setProjectMode(){
		$('body').addClass('projectmode').addClass('transition');
		mouseOverState = false;
		$('.mouse').removeClass('hover');
		setTimeout(function(){
			$('body').removeClass('transition');
		}, 2000);
		setTimeout(function(){
			$('.control-tip').text('scroll');
		}, 1000);
	}
	function removeProjectMode(){
		$('body').removeClass('projectmode').addClass('transition');
		setTimeout(function(){
			$('body').removeClass('transition');
		}, 2000);
		setTimeout(function(){
			$('.control-tip').text('drag');
		}, 1000);
	}

	function getSelected(){
		selectedItem = $('.nav-item.selected');
		selectedPos = selectedItem.offset().left + (selectedItem.outerWidth() / 2);
	}
	function centerSelected(){
		getSelected();
		TweenMax.to('.nav-inner', 0, {x:pageCenter - selectedPos});
		console.log('oui');
	}

	function getCurrTranslation(){
		var matrix = $('.nav-inner').css('transform').replace(/[^0-9\-.,]/g, '').split(',');
		currTranslation = parseFloat(matrix[12]) || parseFloat(matrix[4]);
	}
	



	///////////////////////////////////
	// ROUTER
	///////////////////////////////////

	const home = { template:
		'<div></div>',
	}
	const lappin = { template:
		'#lappin-template',
	}
	const praesto = { template:
		'#praesto-template',
	}
	const studies = { template:
		'#studies-template',
	}
	const router = new VueRouter({
		mode: 'history',
		base: '/portfolio/',
		routes: [
			{
				path: '/',
			},
			{
				path: '/project/lappin',
				component: lappin,
			},
			{
				path: '/project/praesto',
				component: praesto,
			},
			{
				path: '/project/studies',
				component: studies,
			},
			{
				name: '404',
				path: '*',
			},
		]
	});
	
	const app = new Vue({
		router: router
	}).$mount('#app');

	router.afterEach(function(to, from){
		if(to.path == '/'){
			removeProjectMode();
		}
	});

	if (router.currentRoute.name == '404'){
		router.replace('/');
	}
	
	// On load page mode
	if (router.currentRoute.name !== '404' && router.currentRoute.path.split('/')[1] == 'project' && router.currentRoute.path.split('/')[2]){
		var urlProject = router.currentRoute.path.split('/')[2];
		selectedProject = urlProject;
		$('.nav-item').removeClass('selected');
		$('.nav-item[data-project='+urlProject+']').addClass('selected');
		$(document).on('endLoad', function(){
			setProjectMode();
		});
	}

	$('.button').on('click', function(){
		router.push('/project/'+selectedProject);
		setProjectMode();

	});

	$('.border-link.home').on('click', function(){
		if($(document).scrollTop() > 0){
			$('html, body').animate({ scrollTop: 0 }, 800, function(){
				router.push('/');
			});
		}
		else{
			router.push('/');
		}
	});
	$('.border-link.about').on('click', function(){
		router.push('/about');
	});


	///////////////////////////////////
	// LOADER
	///////////////////////////////////

	$('body').removeClass('start');

	$(window).on('load', function() {
		setTimeout(function(){
			$('html, body').scrollTop(0);
		}, 0);
	});

	setTimeout(function(){
		$('body').addClass('loading');
	}, 1000);
	TweenMax.to('.loader-bar', 2, {scaleX: 0, ease: Power1.easeInOut, onComplete: function(){
		$('body').removeClass('loading').addClass('loaded');
		loading = false;
		TweenMax.to('.redbar', 0.5, {scaleX: 1, ease: Power4.easeOut});
		$(document).trigger('endLoad');
	}});



	///////////////////////////////////
	// BORDER
	///////////////////////////////////

	//Custom canvas init
	var canvas = document.getElementById("customAnimation");
	canvas.width = windowWidth * 2;
	canvas.height = windowHeight * 2;
	var borderCtx = canvas.getContext("2d");

	//Canvas border drawing
	borderCtx.beginPath();
	borderCtx.lineWidth = "2";
	borderCtx.strokeStyle = "#e51717";

	//Left border
	borderCtx.moveTo(borderSize, 30);
	borderCtx.lineTo(borderSize, canvas.height - 30);

	//Right border
	borderCtx.moveTo(canvas.width - borderSize, 30);
	borderCtx.lineTo(canvas.width - borderSize, canvas.height - 30);

	//Top border
	borderCtx.moveTo(30, borderSize);
	borderCtx.lineTo(canvas.width - 30, borderSize);

	//Bottom border
	borderCtx.moveTo(30, canvas.height - borderSize);
	borderCtx.lineTo(canvas.width - 30, canvas.height - borderSize);

	borderCtx.stroke();

	//Space for links in border
	$('.border-link').each(function(){
		var linkWidth = $(this).outerWidth() * 2;
		var linkLeft = $(this).offset().left * 2;

		borderCtx.beginPath();
		borderCtx.lineWidth = "2";
		borderCtx.strokeStyle = "#000";

		borderCtx.clearRect(linkLeft, 49, linkWidth, 3);

		borderCtx.stroke();
	});


	///////////////////////////////////
	// NAV INIT
	///////////////////////////////////

	//Get all nav items width
	$('.nav-item').each(function(){
		navItemsWidth = navItemsWidth + $(this).outerWidth();
	});

	//Clone nav item on page load
	for(var i = 0; i < maxLoop; i++){
		navItems.clone().removeClass('selected').attr('data-loop', i+1).appendTo('.nav-inner');
		navItems.clone().removeClass('selected').attr('data-loop', -i-1).prependTo('.nav-inner');
	}

	//Select image on page load
	$('.photo-bg').removeClass('selected');
	$('.photo-bg[data-project='+selectedProject).addClass('selected');


	centerSelected();



	///////////////////////////////////
	// NAV FUNCTIONS
	///////////////////////////////////

	function navMouseDown(e){
		if(!$(e.target).hasClass('button') && !$(e.target).hasClass('border-link') && !$('body').hasClass('projectmode') && !loading){

			globalMouseDown = true;
	
			//Save current positions on mouse down
			if(touchDevice){
				originMouseX = e.touches[0].pageX;
				mouseX = e.touches[0].pageX;
			}
			else{
				originMouseX = e.pageX;
			}

			getCurrTranslation();
			onDownNavTranslation = currTranslation;

			
	
			//Set page on navmode
			$('body').addClass('navmode');
		}
	}
	function navMouseUp(e){
		if(!$(e.target).hasClass('button') && !$(e.target).hasClass('border-link') && !$('body').hasClass('projectmode') && !loading){

			globalMouseDown = false;

			getSelected();

			//The red bar get its initial size 
			TweenMax.to('.redbar', 0.5, {scaleX: 1, x: -(redbarWidth / 2), ease: Power4.easeOut});

			//Get the loop number of the new selected nav item
			var selectedLoop = parseFloat(selectedItem.attr('data-loop'));

			//Increment loop value for each nav item, then delete it if loop value is too high
			if(selectedLoop != 0){
				$('.nav-item').each(function(){
					var newLoop = parseFloat($(this).attr('data-loop')) - selectedLoop;
					$(this).attr('data-loop', newLoop);
					if(Math.abs(newLoop) > maxLoop){
						$(this).remove();
					}
				});
			}

			//Clone nav items to keep the right amount of loops and translate nav to adjust position
			getCurrTranslation();
			if(selectedLoop < 0){
				for(var i = 0; i < Math.abs(selectedLoop); i++){
					navItems.clone().removeClass('selected').attr('data-loop', (-maxLoop-1) + Math.abs(selectedLoop) - i).prependTo('.nav-inner');
				}
				TweenMax.to('.nav-inner', 0, {x:currTranslation - (navItemsWidth * Math.abs(selectedLoop))});
			}
			if(selectedLoop > 0){
				for(var i = 0; i < Math.abs(selectedLoop); i++){
					navItems.clone().removeClass('selected').attr('data-loop', (maxLoop+1) - Math.abs(selectedLoop) + i).appendTo('.nav-inner');
				}
				TweenMax.to('.nav-inner', 0, {x:currTranslation + (navItemsWidth * Math.abs(selectedLoop))});
			}

			//Adjust the nav translation to get the selected item centered
			getCurrTranslation();
			TweenMax.to('.nav-inner', 1, {x:currTranslation - (selectedPos - pageCenter)});

			selectedProject = selectedItem.attr('data-project');
			$('.photo-bg').removeClass('selected');
			$('.photo-bg[data-project='+selectedProject).addClass('selected');

			//Page is no longer in navmode
			$('body').removeClass('navmode');

		}
	}


	///////////////////////////////////
	// EVENTS
	///////////////////////////////////

	if(touchDevice){
		$(document).on('touchstart', function(e){
			navMouseDown(e);
		});
		$(document).on('touchend', function(e){
			navMouseUp(e);
		});
		$(document).on('touchmove', function(e){
			mouseX = e.touches[0].pageX;
			mouseY = e.touches[0].pageY - $(window).scrollTop();
		});
	}
	else{
		//Mouse down event
		$(document).on('mousedown', function(e){
			navMouseDown(e);
		});

		//Mouse up event
		$(document).on('mouseup', function(e){
			navMouseUp(e);
		});

		//Get mouse coordinates
		$(document).mousemove(function(e){
			mouseX = e.pageX;
			mouseY = e.pageY - $(window).scrollTop();
			TweenMax.to('.mouse, .mouse-dot', 0.3, {opacity: 1});
		});

		TweenMax.to('.mouse', 0.3, {x: mouseX - mouseOverlayWidth / 2, y: mouseY - mouseOverlayHeight / 2});
		TweenMax.to('.mouse-dot', 0, {x: mouseX - 1, y: mouseY - 1});

		//Get hover target on specific element
		$(document).on('mouseenter', '.hover-magnet', function(e){

			mouseOverTarget = $(e.target);
			mouseOverState = true;
			$('.mouse').addClass('hover');

		});
		$(document).on('mouseleave', '.hover-magnet', function(){

			mouseOverState = false;
			$('.mouse').removeClass('hover');

		});
	}
	$(document).scroll(function(){
		if($(document).scrollTop() > windowHeight){
			$('.go-to-top').addClass('active');
		}
		else{
			$('.go-to-top.active').removeClass('active');
		}
	})

	$('.go-to-top').click(function(){
		$('html, body').animate({ scrollTop: 0 }, 800);
	});

	$(window).on('hashchange', function(){
		document.location.reload();
	});




	///////////////////////////////////
	// ANIMATION LOOP
	///////////////////////////////////

	function navAnimation() {

		//Get selected nav item
		var selectedItem = $('.nav-item.selected');
		
		if(globalMouseDown){

			//Animation loop to make red bar follow the selected item
			var selectedPos = selectedItem.offset().left + (selectedItem.outerWidth() / 2);
			var selectedWidth = selectedItem.outerWidth();
			var centerDiff = selectedPos - pageCenter;
			TweenMax.to('.redbar', 0.5, {x: (centerDiff/3) - (redbarWidth / 2), ease: Power4.easeOut});
			TweenMax.to('.redbar', 0.5, {scaleX:(selectedWidth / redbarWidth), ease: Power4.easeOut});

			
			$('.nav-item').each(function(){

				//Set selected class on a nav item when it's centered in page
				var itemPos = $(this).offset().left + ($(this).outerWidth() / 2);
				if(windowWidth < 800){
					var detectionSize = 100
				}
				else{
					var detectionSize = 200
				}
				if(itemPos > pageCenter - detectionSize && itemPos < pageCenter + detectionSize){
					$('.nav-item').removeClass('selected');
					$(this).addClass('selected');
					
				}

			});

			//Translate the nav as the mouse move
			if(touchDevice){
				var newTranslation = onDownNavTranslation - ((originMouseX - mouseX) * 2);
				TweenMax.to('.nav-inner', 0.3, {x:newTranslation});
			}
			else{
				var newTranslation = onDownNavTranslation - ((originMouseX - mouseX) * 1.5);
				TweenMax.to('.nav-inner', 0.5, {x:newTranslation});
			}
			
		}

		if(mouseOverState){
			TweenMax.to('.mouse', 0.3, {x: (mouseOverTarget.offset().left + mouseOverTarget.outerWidth() / 2) - (mouseOverlayWidth / 2), y: (mouseOverTarget.offset().top + mouseOverTarget.outerHeight() / 2) - (mouseOverlayHeight / 2) - $(window).scrollTop()});
		}
		else{
			TweenMax.to('.mouse', 0.3, {x: mouseX - mouseOverlayWidth / 2, y: mouseY - mouseOverlayHeight / 2});
		}
		TweenMax.to('.mouse-dot', 0, {x: mouseX - 1, y: mouseY - 1});
		
		requestAnimationFrame( navAnimation );
		
	}
	navAnimation();

});



