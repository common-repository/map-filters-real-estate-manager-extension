jQuery(document).ready(function($){
	$('.p-slide-wrap').each(function(index, el) {
		$(this).find('.price-range').noUiSlider({
			start: [ parseInt(rem_map_form_data.price_min_default), parseInt(rem_map_form_data.price_max_default) ],
			behaviour: 'drag',
			step: parseInt(rem_map_form_data.price_step),
			connect: true,
			range: {
				'min': parseInt(rem_map_form_data.price_min),
				'max': parseInt(rem_map_form_data.price_max)
			},
			format: wNumb({
				decimals: parseInt(rem_map_form_data.decimal_points),
				mark: rem_map_form_data.decimal_separator,
				thousand: rem_map_form_data.thousand_separator,
			}),
		});

		$(this).find('.price-range').Link('lower').to( $(this).find('#price-value-min') );
		$(this).find('.price-range').Link('lower').to( $(this).find('#min-value') );
		$(this).find('.price-range').Link('upper').to( $(this).find('#price-value-max') );
		$(this).find('.price-range').Link('upper').to( $(this).find('#max-value') );
	});
	
	$('.wcp-eq-height > div').matchHeight({byRow: false});
});