<?php
$columns = ($columns != '') ? $columns : '12';
$fields_to_show = ($fields_to_show != '') ? $fields_to_show : 'property_address,search,property_type,property_country,property_purpose,property_price';
?>
<div class="ich-settings-main-wrap" id="filter-map-style-1">
	<div class="row">
		<div class="col-sm-3">
			<?php echo do_shortcode( '[rem_map_search_form
			fields_to_show="'.$fields_to_show.'"
			search_btn_text="'.$search_btn_text.'"
			reset_btn_text="'.$reset_btn_text.'"
			fixed_fields="'.$fixed_fields.'"
			disable_eq_height="'.$disable_eq_height.'"
			agent_id="'.$agent_id.'"
			fields_margin="'.$fields_margin.'"
			icons_by_meta="'.$icons_by_meta.'"
			icons_data="'.$icons_data.'"
			slider_bg_color="'.$slider_bg_color.'"
			slider_handle_color="'.$slider_handle_color.'"
			slider_badge_bg_color="'.$slider_badge_bg_color.'"
			slider_badge_text_color="'.$slider_badge_text_color.'"
			columns="'.$columns.'"]' ); ?>
		</div>
		<div class="col-sm-9">
			<?php echo do_shortcode( "[rem_map_area
			lat='".$lat."'
			long='".$long."'
			zoom='".$zoom."'
			map_height='369px'
			address='".$address."']" ); ?>
		</div>
	</div>
</div>