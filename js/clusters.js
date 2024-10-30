(function($) {
	/* show hide overlay */
	function overlay(){
		if( $(mapContainer).find('.fmp_overlay').is(':visible') ){
			$(mapContainer).find('.fmp_overlay').fadeOut('fast');
			$(mapContainer).find('.fmp_imageover').fadeOut('fast');
		}
		else{
			$(mapContainer).find('.fmp_overlay').fadeIn('fast');
			$(mapContainer).find('.fmp_imageover').fadeIn('fast');		
		}
	}
	
	/* clear all markers and object containers */
	function clearStuff(){
		$('#fmp_search_results').slideUp( 250 );
		failedObject = [];
		
		if( infoWindow.getMap() ){
			infoWindow.close();
			/* enable zoom on mouse scroll after the infoWindow is closed*/
			map.setOptions({
				scrollwheel: true
			});
		}
		
		if( contentData.length > 0 ){
			for (var i=0; i<contentData.length; i++) {
				contentData[i].setMap( null );
			}
			contentData = [];
			failedObject = [];
		}
	}
	
	/* create info window */
	function infoWindowData( data, id ){
		/* if there is some images than create slider */		
		var lightboxRel = '';
		var report = '';
		var top = '';
		var blocks = '';
		var images = '';
		var i;
		
		/* wrap it all in content */
		var content = 
			'<div class="fmp_content">'+
				'<div class="fmp_body">'+
					data.property_box
				'</div>'+
			'</div>'+
			'';
		return content;
	}
	
	/* function to append objects, which are failed to locate on map, to some container, i it is set*/
	function showFailed(){
		/* CUSTOM EVENT */
		if( options.onBeforeFailedObjects !== undefined ){
			options.onBeforeFailedObjects();
		}
		
		/* CUSTOM EVENT */
		if( options.onFailedObject !== undefined ){		
			for( var i=0; i<failedObjects.length; i++ ){
				options.onFailedObject( failedObjects[i], i );
			}
		}
		
		/* CUSTOM EVENT */
		if( options.onAfterFailedObjects !== undefined ){
			options.onAfterFailedObjects( failedObjects );
		}
	}
	
	/* bind listeners for marker clicks */
	function prepareListeners(){	

		
		/* bind on click to reset markers */
		$(document).on( 'click', '.fmp_search_reset', function(){
			clearStuff();
			
			/* CUSTMO EVENT */
			if( options.onResetSearch !== undefined ){
				options.onResetSearch( this );
			}
		});		
		/* fancybox2 is using .live() method so it will be fired o all new images.  */
		if( options.useFancybox ){
			$('a.fmp_image').fancybox(options.fancyBoxOptions);
		}
				
		if( options.reportMarker ){
			$(document).on( 'click', 'a[id^=report_]', function(event) {
				var report = $(this).parent();
				var markerId = $(this).attr('id').split("_")[1];
				var uniqueID = $(this).attr('data-src');
				var marker = contentData[markerId];

				marker.setDraggable( true );
				report.html( options.language.dragMarker );
				
				google.maps.event.addListener( marker, 'dragend', function(event) {
					var latitude = event.latLng.lat();
					var longitude = event.latLng.lng();

					/* CUSTOM EVENT*/
					if( options.onReportDragEnd !== undefined){
						options.onReportDragEnd( marker, latitude, longitude );
					}
					
					report.html( options.language.sendLocation + '<a href="javascript:;" class="fmp_send_position">'+options.language.yes+'</a>');
					
					$('.fmp_send_position').click(function(){					
						$.ajax({
							url: options.reportMarkerURL,
							method: "POST",
							data: {ID: uniqueID, latitude: latitude, longitude: longitude},
							success: function( response ){
								marker.setDraggable( false );
								if( !response.error ){
									report.html( options.language.locationSent );
									/* CUSTOM EVENT*/
									if( options.onReportSuccess !== undefined){
										options.onReportSuccess( marker, response ); 
									}
								}
								else{
									report.html( response.error );
									/* CUSTOM EVENT*/
									if( options.onReportError !== undefined){
										options.onReportError( marker, response ); 
									}
								}								
							},
							error: function( jqXHR, textStatus, errorThrown ){
								/* CUSTOM EVENT*/
								if( options.onConnectionError !== undefined){
									options.onConnectionError( jqXHR, textStatus, errorThrown ); 
								}
							}
						});
					});
				});	

				/* CUSTOM EVENT*/
				if( options.onReport !== undefined){
					options.onReport( marker ); 
				}
				
			});
		}
	}
	
	/* update total numbers and pagination */
	function updateSearchResults(){
		if( responseData.pagination ){
			$('#fmp_pagination').html( responseData.pagination );
			$('#fmp_pagination a').click(function(event){
				event.preventDefault();
				/* CUSTOM EVENT */
				if( options.onPaginationClick !== undefined ){
					options.onPaginationClick( this );
				}
								
				var url = $(this).attr('href');
				searchData( url );
				
			});			
		}		
		$('#fmp_search_results').slideDown( 350 );
	}
	
	/* call these functions after the last result from response */
	function finishResponse(){
		overlay();						
		showFailed();
		updateSearchResults();
		
		/* CUSTOM EVENT */
		if( options.onAfterSearch !== undefined ){
			options.onAfterSearch();
		}
	}
	
	/* handle search results */
	function handleResult(){
		/* this is used to check when the last marker is set */
		var responseCounter = 0;
		var results = responseData.results;
		if ($('.property-search-results').length > 0) {
			$('.property-search-results').html(responseData.properties);
		// console.log(responseData.properties);
		}
		
		if( results.length === 0 ){
			finishResponse();
		}
		else{
			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < results.length; i++) {
			 bounds.extend({lat: parseFloat(results[i].latitude), lng: parseFloat(results[i].longitude)});
			 // console.log({lat: parseFloat(results[i].latitude), lng: parseFloat(results[i].longitude)});
			}
			map.fitBounds(bounds);
			for( var i=0; i<results.length; i++){
				(function( object, id ) {
					/* make this asyncronuous becaue of the number of markers */
					setTimeout(function(){
						/* if there is latitude and longitude set, than show the marker */
						if( object.latitude != "" && object.longitude != "" ){
							var objectPosition = new google.maps.LatLng(object.latitude, object.longitude);
							/* set options and create marker */
							var markerOptions = {};
							$.extend( markerOptions, options.markerOptions );
							markerOptions.position = objectPosition;
							markerOptions.map = map;
							console.log(object);
							markerOptions.icon = object.icon || options.markerOptions.icon;
							markerOptions.draggable = false;
							var marker = new google.maps.Marker(markerOptions);
							marker.markerId = id;
							marker.uniqueID = object.ID || id;
				
							/* append marker window to marker description */
							marker.desc = infoWindowData( object, id );
							
							if( options.markVisited ){
								marker.visitedIcon = object.icon_visited || options.visitedIcon;
							}
							
							oms.addMarker( marker ); 
							
							/* push all to contentData */
							contentData.push( marker );
						}
						/* else push it to failedObjects object and show all of the failed objects in special container after the all markers are set */
						else{
							failedObjects.push( object );
						}
						/* check if it is the end and show failed ones */
						if( responseCounter == results.length - 1 ){
							finishResponse();
						}
						else{
							responseCounter++;
						}
					},0);
				})( results[i], i);
			}
		}
	}

	/* remove current radiusMarker */
	function removeRadiusMarker(){	
		if( radiusMarker ){
			radiusMarker.setMap( null );
			radiusCircle.setMap( null );
		
			radiusMarker = undefined;
			radiusCircle = undefined;
			
			$('.fmp_search_radius').remove();
		}
	}
	
	/* append these fields to search form if distnace from selected marker is calculated on the server side */
	function searchRadiusForm(){
		$(options.searchForm).append(
			'<div class="fmp_search_radius">'+
				'<input type="hidden" class="fmp_search_radius" name="radius" value="">'+
				'<input type="hidden" class="fmp_search_latitude" name="latitude" value="">'+
				'<input type="hidden" class="fmp_search_longitude" name="longitude" value="">'+
			'</div>');
	}
	/* update coordinates of marker on dragend or on new marker placemnet. These coordinates are used only if the search is on the server side */
	function updateSearchFormLatLng( latlng ){
		$('.fmp_search_latitude').val( latlng.lat() );
		$('.fmp_search_longitude').val( latlng.lng() );	
	}

	/* update radius of marker on resize or on new marker placemenet. Value is used only if the search is on the server side */
	function updateSearchFormRadius(){
		$('.fmp_search_radius').val( radiusCircle.getRadius() );	
	}
	
	
	/* convert to selected unit and place into radius input box */
	function setRadiusInput(){
		var val = options.radiusOptions.radius * options.radiusUnits[$('#fmp_radius_unit').val()].multiplier;
		$('#fmp_radius_value').val( val.toFixed( options.radiusDecimal ) );	
	}


	
	/* prepare for raius search */
	function prepareRadiusSearch( latlng ){
		/* clear previous radiusMarker */
		removeRadiusMarker();
		
		searchRadiusForm(); 		
				
		/* create marker that will be used as center for radius */
		var markerOptions = {};
		$.extend( markerOptions, options.markerOptions );
		markerOptions.position = latlng;
		markerOptions.map = map;
		markerOptions.icon = options.radiusMarkerIcon;
		markerOptions.draggable = true;
		radiusMarker = new google.maps.Marker(markerOptions);
		/* remove listeners if there is some */		
		google.maps.event.clearListeners( radiusMarker, 'click' );
		google.maps.event.clearListeners( radiusMarker, 'rightclick' );
		google.maps.event.clearListeners( radiusMarker, 'dragend' );
		
		/* must be options */
		var circleOptions = {
			map: map,
			editable: true
		};			
		
		/* add the rest of options from default options */
		$.extend( circleOptions, options.radiusOptions );
		/* create initial radius */
		radiusCircle = new google.maps.Circle( circleOptions );
		/* bind the circle to the center of radiusMarker */
		radiusCircle.bindTo( 'center', radiusMarker, 'position' );
		/* remove listeners from radius circle */
		google.maps.event.clearListeners( radiusCircle, 'radius_changed' );
		
		/* on radius change by resize update hidden form and radius input box */ 
		google.maps.event.addListener( radiusCircle, 'radius_changed', function() {
			options.radiusOptions.radius = radiusCircle.getRadius();
			updateSearchFormRadius();
			setRadiusInput();
			
			/* CUSTOM EVENT */
			if( options.onRadiusChange !== undefined ){
				options.onRadiusChange( radiusMarker, radiusCircle );
			}
			
		});
		
		/* bind on radiusMarker click to remove it */
		google.maps.event.addListener( radiusMarker, 'click', function() {
			$('#fmp_radius').slideUp( 250 );
			$('#fmp_search_addresses').val('');
			removeRadiusMarker();
			
			/* CUSTOM EVENT */
			if( options.onRadiusMarkerRemove !== undefined ){
				options.onRadiusMarkerRemove();
			}
		});	
		/* bind on radiusMarker end draging to remove it */
		google.maps.event.addListener( radiusMarker, 'dragend', function(event) {
			updateSearchFormLatLng( event.latLng );
			updateSearchFormRadius();
			/* CUSTOM EVENT */
			if( options.onRadiusMarkerMove !== undefined ){
				options.onRadiusMarkerMove( radiusMarker, radiusCircle, latlng.lat(), latlng.lng() );
			}
		});

		/* show radius options */
		$('#fmp_radius').slideDown( 250 );
		
		/* update hidden forms */
		updateSearchFormLatLng( latlng );
		updateSearchFormRadius();
		/* update radius inputbox */
		setRadiusInput();
	}
	
	function radiusSearchPrepare(){
		/* create select box from available radius units  */
		var selectUnits = '<select id="fmp_radius_unit">';
		for( var unit in options.radiusUnits ){
			selectUnits += '<option value="'+unit+'">'+options.radiusUnits[unit].label+'</option>';
		}
		selectUnits += '</select>';
		/* create radius options and append to the map */
		$(mapContainer).append('<div id="fmp_radius">'+
			'<span class="title">'+options.language.radius+'</span><input type="text" id="fmp_radius_value" value="'+options.radiusOptions.radius+'">'+
			selectUnits	+
			'<input type="text" id="fmp_search_addresses" placeholder="'+options.language.search+'">'+
		'</div>');		
		map.controls[google.maps.ControlPosition[options.radiusOptionsPos]].push(document.getElementById('fmp_radius'));
		
		/* append search box */
		var searchBox = new google.maps.places.SearchBox(document.getElementById('fmp_search_addresses'));
		/* listen for location select and append marker to the first place*/
		google.maps.event.addListener(searchBox, 'places_changed', function() {
			var places = searchBox.getPlaces();
			if( places[0] ){
				prepareRadiusSearch( places[0].geometry.location );
			}
			
			/* CUSTOM EVENT */
			if( options.onRadiusMarkerMove !== undefined ){
				options.onRadiusMarkerMove( radiusMarker, radiusCircle, places[0].geometry.location.lat(), places[0].geometry.location.lng() );
			}
		});
		
		/* put marker with right click */
		google.maps.event.addListener(map, 'rightclick', function(event) {
			prepareRadiusSearch( event.latLng );
			
			/* CUSTOM EVENT */
			if( options.onRadiusMarkerAdd !== undefined ){
				options.onRadiusMarkerAdd( radiusMarker, radiusCircle, event.latLng.lat(), event.latLng.lng() );
			}
		});
		
		/* on input change update radius */
		$(document).on( 'change', '#fmp_radius_value', function(event){
			var radius = $(this).val() / options.radiusUnits[$('#fmp_radius_unit').val()].multiplier;
			if( !isNaN( radius ) ){
				options.radiusOptions.radius = radius;
				radiusCircle.setRadius( radius );
			}
			else{
				alert( options.language.valueError );
			}
		});
		
		/* on unit change update valu in radius input box */
		$(document).on( 'change', '#fmp_radius_unit', function(){			
			setRadiusInput();
		});
	}
	
	/*show map*/
	function showMap( location, bindListeners ){
		/* set default location */
		options.mapOptions.center = location;
		map = new google.maps.Map(mapContainer, options.mapOptions);	
		oms = new OverlappingMarkerSpiderfier(map,{circleSpiralSwitchover: 90});

		google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
			/* CUSTOM EVENT */
			if( options.onAfterMap !== undefined ){
				options.onAfterMap( map );
			}
		});		

		/* append overlays and radius update box */
		$(mapContainer).append(
			'<div class="fmp_overlay"></div>'+
			'<div class="fmp_imageover"></div>'+
			'<div id="fmp_search_results">'+
				'<div id="fmp_pagination"></div>'+
				'<a href="javascript:;" class="fmp_search_reset">'+options.language.reset+'</a>'+
			'</div>');
		
		if( options.allowRadiusSearch ){
			radiusSearchPrepare();
		}

		if( $(options.searchPaginationPos).length > 0 ){
			$(options.searchPaginationPos).html(document.getElementById('fmp_search_results'));
		}
		else{
			map.controls[google.maps.ControlPosition[options.searchPaginationPos]].push(document.getElementById('fmp_search_results'));
		}
	
		/* create infoBox */
		infoWindow = new InfoBox( options.infoBoxOptions );	
		
		google.maps.event.addListener(infoWindow, "closeclick", function(e)
		{
			/* enable zoom on mouse scroll after the infoWindow is closed*/
			map.setOptions({
				scrollwheel: true
			});
			
			/* CUSTOM EVENT */
			if( options.onInfoBoxClose !== undefined ){
				options.onInfoBoxClose();
			}
		});	
		
		oms.addListener( 'click', function( marker, event ) {
			if( infoWindow.getMap() ){
				infoWindow.closeIt();
				// return;
			}
			/* disable zoom on mouse scroll */
			map.setOptions({
				scrollwheel:false
			});
			/* set marker as visited on click */
			marker.setTitle( options.language.visited );
			
			infoWindow.setContent( marker.desc );
			infoWindow.open( map, marker );
			
			if( options.markVisited ){
				marker.icon = marker.visitedIcon;
			}
			
			/* CUSTOM EVENT */
			if( options.onInfoBoxOpen !== undefined ){
				options.onInfoBoxOpen( marker, infoWindow );
			}
		});
		/* add animation to opening info window */
		google.maps.event.addListener(infoWindow, 'beforeclose', function() {
			$('.infoboxclose').animate(
				{
					right: '340px',
					opacity: '0'
				},
				options.infoBoxOptions.closeOutSpeed,
				function(){
					$('.infoBox').slideUp( options.infoBoxOptions.boxOutSpeed, function(){
						infoWindow.closeIt();
					});
				}
			);
		});		
		/* add animation to opening info window */
		google.maps.event.addListener(infoWindow, 'domready', function() {
			 $('.infoBox').css('visibility','visible').hide().slideDown( options.infoBoxOptions.boxInSpeed, function(){
				$('.infoboxclose').animate(
					{
						right: '-15px',
						opacity: '1'
						
					},
					options.infoBoxOptions.closeInSpeed,
					function(){
						infoWindow.panBox_( false );
					}
				);
			 } );			 
		});
		if( bindListeners ){			
			prepareListeners();
		}
	}
	
	/* calculate Latitude and Longitude for desired place */
	function startMap( bindListeners ){
		/* CUSTOM EVENT */
		if( options.onBeforeMap !== undefined ){
			options.onBeforeMap();
		}	
		
		/* set map to some city or country */
		if( options.startPosition ){
			showMap( options.startPosition, bindListeners );
		}
		else if( options.startAddress === '' ){
			showMap( new google.maps.LatLng(0, 0), bindListeners );
		}
		else{
			geocoder.geocode({
				'address': options.startAddress
			}, function(results, status) {
				if ( !results.error ){
					if (status == google.maps.GeocoderStatus.OK) {
						showMap( results[0].geometry.location, bindListeners );
					}
					else{
						showMap( new google.maps.LatLng(0, 0), bindListeners );
					}
				}
				else{
					showMap( new google.maps.LatLng(0, 0), bindListeners );
				}
			});	
		}	
	}
	
	function displayResponseError( textStatus, errorThrown ){
		var message;
		switch( textStatus ){
			case 'timeout' 		: message = options.language.timeoutMsg; break;
			case 'error' 		: message = options.language.errorMsg + errorThrown; break;
			case 'abort' 		: message = options.language.abortMsg; break;
			case 'parsererror' 	: message = options.language.parseerrorMsg; break;
			default				: message = options.language.defaultMsg; break;
		}
		alert( message );
	}
	
	/* function for searching */
	function searchData( url ){
		/* CUSTOM EVENT */
		clearStuff();
		if( options.onBeforeSearch !== undefined ){
			options.onBeforeSearch();
		}	
		overlay();
		$.ajax({
			url: url,
			data: $(options.searchForm).serialize(),
			type: "POST",
			dataType: "json",
			success: function( response ){
				if( !response.error){
					responseData = response;					
					handleResult();
					/* CUSTOM EVENT */
					if( options.onSearchSuccess !== undefined ){
						options.onSearchSuccess();
					}
				}
				else{
					/* CUSTOM EVENT */
					if( options.onSearchError !== undefined ){
						options.onSearchError( response );
					}				
				}
			},
			error: function( jqXHR, textStatus, errorThrown ){
				overlay();
				if( options.onConnectionError !== undefined){				
					/* CUSTOM EVENT */
					options.onConnectionError( jqXHR, textStatus, errorThrown );
				}
			}
		});	
	}

	
	/* fire it all up */
	function initialize(){
		$(mapContainer).addClass('fmp_responsive_map');
		startMap( true ); /* false - bind listeners */
		
		/* connect with the search form and wait for its submission */
		$( 'input[type="submit"], button[type="submit"]', $(options.searchForm) ).on( 'click', function(event){
			event.preventDefault();			
			var url = $(options.searchForm).attr("action");
			searchData( url );
		});
		$(window).load(function() {
			var url = $(options.searchForm).attr("action");
			searchData( url );
		});
	}

	/* response container */
	var responseData;
	/* info window */
	var infoWindow;
	/* where to put map */
	var mapContainer;
	/* global map */
	var map;
	/* overlaping marker */
	var oms;
	/* array of objects {infoWindow: widow, marker: marker} */
	var contentData = [];
	var failedObjects = [];
	/* marker that is used as center for radius */
	var radiusMarker;
	var radiusCircle;
	/* global geocoder */
	var geocoder = new google.maps.Geocoder();
	/*default options*/
	var options = {
		searchForm: '',
		startAddress: '',
		startPosition: false,
		mapOptions: {
			zoom: 12,
			styles:[{
				featureType: "poi",
				stylers: [
					{ visibility: "off" }
				]
			}]
		},
		language: {
			visited			: 'Visited',
			reset			: 'Reset',
			search  		: 'Place marker by address',
			report			: 'Report',
			sendLocation	: 'Send this location? ',
			locationSent	: 'Location sent',
			yes				: 'Yes',
			dragMarker		: 'Drag Marker',
			valueError		: 'Please use numbers only',
			radius			: 'Radius: ',
			timeoutMsg		: 'Timeout occurred while we processed your request.',
			errorMsg		: 'Next error occurred while we processed your request: ',
			abortMsg		: 'Abort occurred while we processed your request.',
			parseerrorMsg	: 'Parsing error occurred while we processed your request.',
			defaultMsg		: 'There was an error processing your request, please try again.'
		},
		useLightbox: false,
		useFancybox: false,
		fancyBoxOptions: {},
		infoBoxOptions: {
			pixelOffset: new google.maps.Size(-43, 0),
			closeBoxMargin: "0px",
			yOffset: 20,
			boxInSpeed: 250,
			boxOutSpeed: 250,
			closeInClose: 250,
			closeOutSpeed: 250
		},
		radiusUnits: {
			"Mi": {
				label: "miles",
				multiplier: 6.2137273664980675307890191009979e-4
			},
			"km": {
				label: "kilometers",
				multiplier: 0.001
			},
			"m": {
				label: "meters",
				multiplier: 1
			}
		},
		radiusOptions: {
			radius: 1500,
			strokeColor: '#3A9FED',
			strokeWeight: 1,
			fillColor: '#79B9F9'		
		},
		radiusDecimal: 4,
		allowRadiusSearch: true,
		markerOptions: {},
		radiusMarkerIcon: '',
		reportMarker: false,
		reportMarkerURL: '',
		searchPaginationPos: "RIGHT_BOTTOM", //position on map or class or id of container
		radiusOptionsPos: "TOP_LEFT",
		markVisited: false,
		visitedIcon: '',
		
		/* EVENTS */
		onConnectionError: function( jqXHR, textStatus, errorThrown ){ displayResponseError( textStatus, errorThrown ); }, //function( marker, jqXHR, textStatus, errorThrown ){}
	
		onBeforeSearch: undefined, //function(){}
		onAfterSearch: undefined, //function(){}
		onSearchSuccess: undefined, //function(){}
		onSearchError: undefined, //function( response ){}
		onResetSearch: undefined, //function( element ){}
				
		onBeforeMap: undefined, //function(){}
		onAfterMap: undefined, //function( map ){}
		
		onBeforeFailedObjects: undefined, //function(){}
		onFailedObject: undefined, //function( objectData, id ){}
		onAfterFailedObjects: undefined, //function( failedObjects ){}		
		
		onPaginationClick: undefined, //function( element ){}
		
		onRadiusChange: undefined, //function( marker, circle ){}
		onRadiusMarkerAdd: undefined, //function( marker, circle, latitude, longitude ){}
		onRadiusMarkerRemove: undefined, //function(){}
		onRadiusMarkerMove: undefined, // function( marker, circle, latitude, longitude ){}
				
		onReport: undefined, //function( marker ){}
		onReportDragEnd: undefined, //function( marker, latitude, longitude ){}
		onReportSuccess: undefined, //function( marker, response ){}
		onReportError: undefined, //function( marker, response ){}
		
		onInfoBoxOpen: undefined, //function( marker, infoBox ){}
		onInfoBoxClose: undefined //function(){}
	};
	
	/* create main function */
	$.fn.findmyplace = function( opts ) {
		return this.each(function(){
			$.extend( options, opts );		
			mapContainer = this;
			initialize();
		});
	};
	
	/* create update function */
	$.fn.updatemyplace = function( opts ) {
		/* set as false, and if there is some in update function that ue that. This is to make sure that, if on update there is only address and on primary latlng object, latlng object would not overide address  */
		options.startPosition = false;
		$.extend( options, opts );
		clearStuff();
		removeRadiusMarker();
		startMap( false ); /* false - do not bind listeners */
		
		return this;
	};	
})(jQuery);