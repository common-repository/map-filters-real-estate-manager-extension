<?php
$columns = ($columns != '') ? $columns : '5th-1';
$fields_to_show = ($fields_to_show != '') ? $fields_to_show : 'property_type,property_status,property_bedrooms,property_purpose';
?>
<div class="ich-settings-main-wrap" id="filter-map-style-4">
	<div class="row">
		<div class="col-sm-12">
			<?php echo do_shortcode( "[rem_map_area
			lat='".$lat."'
			long='".$long."'
			zoom='".$zoom."'
			map_height='369px'
			address='".$address."']" ); ?>
		</div>
		<div class="col-sm-12">
			<?php echo do_shortcode( '[rem_map_search_form
			fields_to_show="'.$fields_to_show.'"
			search_btn_text="'.$search_btn_text.'"
			reset_btn_text="'.$reset_btn_text.'"
			fixed_fields="'.$fixed_fields.'"
			disable_eq_height="'.$disable_eq_height.'"
			agent_id="'.$agent_id.'"
			fields_margin="'.$fields_margin.'"
			icons_by_meta="'.$icons_by_meta.'"
			slider_bg_color="'.$slider_bg_color.'"
			slider_handle_color="'.$slider_handle_color.'"
			slider_badge_bg_color="'.$slider_badge_bg_color.'"
			slider_badge_text_color="'.$slider_badge_text_color.'"			
			icons_data="'.$icons_data.'"
			columns="'.$columns.'"]' ); ?>
		</div>
	</div>
</div>