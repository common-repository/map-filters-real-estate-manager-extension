jQuery(document).ready(function($) {
	var maps_attrs = {
		searchForm: '.map-filter-form',
		startAddress: rem_maps_data.address,
		allowRadiusSearch: false,
		mapOptions:  {
			zoom: parseInt(rem_maps_data.zoom),
			styles: (rem_maps_data.map_styles != '') ? JSON.parse(rem_maps_data.map_styles) : undefined,
		},
		reportMarker: false,
		useLightbox: false,
		markVisited: true,
	}
	if(rem_maps_data.lat != '' && rem_maps_data.long != ''){
		maps_attrs.startPosition = {
			lat: parseFloat(rem_maps_data.lat),
			lng: parseFloat(rem_maps_data.long)
		}
	}
	$('#map-canvas').findmyplace(maps_attrs);
});