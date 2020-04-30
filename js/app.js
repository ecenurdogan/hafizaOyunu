'use strict';
(function($) {

	// shuffle function
	function shuffle(array) {
	    var currentIndex = array.length, temporaryValue, randomIndex;

	    while (currentIndex !== 0) {
	        randomIndex = Math.floor(Math.random() * currentIndex);
	        currentIndex -= 1;
	        temporaryValue = array[currentIndex];
	        array[currentIndex] = array[randomIndex];
	        array[randomIndex] = temporaryValue;
	    }
	    return array;
	}
	// array of icons;
	let iconsSet = ['fa-diamond','fa-paper-plane-o','fa-anchor',
				 'fa-bolt','fa-cube','fa-leaf','fa-bicycle','fa-bomb'];

	// create responsive grid
	const flexGrid = Math.sqrt(iconsSet.length * 2);

	for (let i = 0; i < flexGrid; i++ ) {

		$('.deck').append('<div class="row">');

		for (let y = 0; y < flexGrid; y++ ) {
			$('.row').last().append('<li class="card">');
		}
	}

	let size = $('.row').width()/flexGrid;
		$('.card').height( size - 20 );
		$('.card').width( size - 20 );

	$(window).resize(function() {
		let size = $('.row').width()/flexGrid;
		$('.card').height( size - 20);
		$('.card').width( size - 20 );
	})

	const cards = $('.deck li'),

	// change here to set the number of moves needed to change star rating
	maxMoves = 10;

	// create a doubled array from given icons and shuffle them
	const icons = shuffle(iconsSet.concat(iconsSet.map(e=>e))); // array

	// insert i element inside each card
	cards.each((i,e) => $(e).html(`<i class="fa"></i>`));

 	let clicksList = {};
 	let openStatus = 0;

 	/*
 	TODO: click event handler function
 	*/
	const cardClick = function() {
		let clicks = 0;
		return function(evt, num){
			if( num !== undefined ){
				clicks = num;
				return;
			}else{
				clicks++;
			}
			// get index of a clicked card
			const index = cards.index(this); // number

			if( clicks <= 2 ) {
				// add icon class dynamically on click event
				$(this).children('i').addClass(`${icons[index]}`);
				// show icon (flip the card) and disable click
				$(this).addClass('open show').off('click');
				// add to the clicks list
				clicksList[index] = icons[index];
				//TODO: when two cards clicked then checkCards function run
				if ( Object.keys(clicksList).length === 2 ) {
					setTimeout(checkCards, 500);
				}
			}
		}
	}();

	/*
 	TODO: check match cards function
 	*/
	const checkCards = function() {
		let counter = 0, matches = icons.length/2; // number
		return function(num, match) {
			if( num !== undefined ) { // reset all
				counter = num;
				matches = icons.length/2;
				clicksList = {};
				cardClick(0,0);
				return;
			}else{
				counter++;
			}
			//get values of a clicked cards in an array;
			const compare = Object.values(clicksList); //array

			if (compare.length === 2 && compare[0] === compare[1] ) {
				// if two cards clicked and cards matched
				$(`.${compare[0]}`).parent().addClass('match');
				matches--;
				clicksList = {};
				cardClick(null,0);
			}else if( openStatus === 0 ) { // ignore all clicks occured while animation didn't finished
				$(`.${compare[0]},.${compare[1]}`).parent().addClass('mismatch')
				setTimeout(function() {
					/* remove icon dinamically, cover the card (flip)
					and enable click event */
					$(`.${compare[1]}`).removeClass(`${compare[1]}`).parent()
							.removeClass('open show mismatch').on('click', cardClick);
					$(`.${compare[0]}`).removeClass(`${compare[0]}`).parent()
							.removeClass('open show mismatch').on('click', cardClick);
					cardClick(null,0)
					clicksList = {};
				},500);
			}

			// show moves count
			$('.moves').text(counter);

			// stars rating change
			counter % maxMoves === 0 ? $('.fa-star').last()
				.removeClass('fa-star').addClass('fa-star-o') : '';

			// when game is finished
			if( matches === 0 ) {
				setTimeout(animateCards('waterfall'), 300);
				setTimeout(showInfoBox, 2000);
			}
		}
	}();

	/*
 	TODO: restart game function, shuffle cards
 	*/
	function reloadDeck() {
		$('.info-box').fadeOut('slow');
		cards.off('click'); // reset click events (for case if click occured while animation)
		shuffle(icons); // shuffle icons
		timerStart(null,0); // stop and reset timer
		checkCards(0,0); // reset clicksList
		$('.mins').html('00');
		$('.secs').html('00');
		cards.removeClass('open show match mismatch falldownRight falldownLeft')
												 .find('i').attr('class', 'fa');
		$('.fa-star-o').removeClass('fa-star-o').addClass('fa-star');
		$('.moves').text(0);
		cards.on('click', function() {
			animateCards( 'showOnStart', 10 );
		});
	}

	/*
 	 * TODO: run timer function
 	 */
	const timerStart = function() {
		let mins = 0, secs = 0, timer;
		return function(evt, num) {
			cards.off('click', timerStart);
			if( num !== undefined ) {
				mins = secs = 0;
				clearInterval(timer);
				cards.on('click', timerStart);
				return;
			}else{
				return timer = setInterval(function() {
					if( secs + 1 === 60 ) {
						mins++; secs = 0;
					}else{
						secs++;
					}
					$('.mins').html(mins < 10 ? '0' + mins : mins);
					$('.secs').html(secs < 10 ? '0' + secs : secs);
				}, 1000);
			}
		}
	}();

	/*
	 * cards animation function with random delay
	 */

	const animateCards = function(animation, speed) {
		openStatus = 1;
		timerStart(null,0);
		let numberArr = [...Array(cards.length).keys()]; // get range of animations
		let randomDelay, min = 0, max = cards.length;

		/* need to count setTimeout functions to determine
		which animation occured as last, because all setTimeouts has own random delay*/
		let animationCount = 0;

		for ( let i = numberArr.length; i >= 0; i-- ) {
			randomDelay = Math.floor(Math.random() * (1000 - 100 + 100)) + (speed!==undefined?speed:500);
			animationRule( numberArr[i], randomDelay, animation);
		}

		// bind event listener: when animation is finished, we can bind another listener for start the game
		cards.on('click', function() {
			if( !$(cards).hasClass('open show') && animationCount > numberArr.length ) {
				cards.off('click'); // prevent max call stack
				cards.on('click', timerStart );
				cards.on('click', cardClick );
				$(this).trigger('click');
				openStatus = 0;
			}
		});
		function animationRule(element, randomDelay, animation) {
			cards.off('click');
			setTimeout(function() {
				switch ( animation ) {
					case 'waterfall': //animation at the end
	    				$(cards[element]).addClass(Math.random()<0.5?'falldownRight':'falldownLeft');
					break;
					case 'showOnStart': // animation on start
	    				$(cards[element]).addClass('open show').children('i').addClass(`${icons[element]}`);;
	    				setTimeout(function(){
	    					$(cards[element]).removeClass('open show').find('i').attr('class', 'fa');
	    				}, 1800);
					break;
				}
				animationCount++;
			},randomDelay);
		}
	}

	/*
	 * Show info-box function
	 */
	const showInfoBox = function() {
		const info = [], resultTable = $('#results');
		let counter = 0;
		return function(reset) {
			if ( reset !== undefined ) {
				info.length = 0;
				counter = 0;
			}
			const result = {};
			result.counter = counter + 1;
			result.moves = parseInt( $('.moves').text() );
			result.time = $('.mins').text() + ' : ' + $('.secs').text();
			result.stars = $('.fa-star').length;
			// Statistics for one match per seconds
			result.stat = ( parseInt( $('.mins').text() ) * 60 +
						    parseInt( $('.secs').text() ) ) / (icons.length / 2);
			result.message = function(){
								return `<ul>
										<li>${this.counter}</li>
										<li>${this.moves}</li>
									    <li>${this.time}</li>
										<li>${this.stars}</li>
									    <li>${(this.stat).toFixed(2)}</li></ul>
									    `;
							};
			counter++;
			info.push(result);
			resultTable.empty();
			for( let i = 0; i < info.length; i++ ) {
				resultTable.append(info[i].message());
			}
			$('.info-box').fadeIn('slow');
		}
 	}()

	// game start & restart events

	$('.restart').on('click', reloadDeck);

	cards.on('click', function() {
		animateCards( 'showOnStart', 10 );
	});


})(jQuery)
