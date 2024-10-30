<?php

function rem_search_properties_on_map($query_args, $icons_data, $icons_by_meta){
	
	$result = array();
	$property_query = new WP_Query( $query_args );
	global $rem_sc_ob;
	if( $property_query->have_posts() ){
        while( $property_query->have_posts() ){ $property_query->the_post();
        	if (get_post_meta( get_the_id(), 'rem_property_latitude', true ) != '') {
		 		$single_property = array(
		 			'ID' => get_the_id(),
		 			'title' => get_the_title(),
		 			'property_box' 	=> $rem_sc_ob->map_box(get_the_id()),
		 			'latitude' => get_post_meta( get_the_id(), 'rem_property_latitude', true ),
		 			'longitude' => get_post_meta( get_the_id(), 'rem_property_longitude', true ),
		 		);

                $map_meta_by = get_post_meta(get_the_id(), 'rem_'.$icons_by_meta, true);
                // var_dump($map_meta_by); exit;
                if (isset($icons_data[$map_meta_by]['static']) && $icons_data[$map_meta_by]['static'] != '') {
                    $active_map_pin = $icons_data[$map_meta_by]['static'];
                } else {
                    $active_map_pin = rem_get_option('maps_property_image', REM_URL . '/assets/images/maps/cottage-pin.png');
                }

                if (isset($icons_data[$map_meta_by]['hover']) && $icons_data[$map_meta_by]['hover'] != '') {
                    $hover_map_pin = $icons_data[$map_meta_by]['hover'];
                } else {
                    $hover_map_pin = rem_get_option('maps_property_image_hover', REM_URL . '/assets/images/maps/cottage-hover-pin.png');
                }

                $single_property['icon'] = $active_map_pin;
                $single_property['icon_visited'] = $hover_map_pin;

		 		$result[] = $single_property;
        	} 
		}
		wp_reset_postdata();
	}
	
	return $result;
}

function rem_search_properties_off_map($query_args){
    $the_query = new WP_Query( $query_args );
    ob_start();
    ?>

    <?php if ( $the_query->have_posts() ) : ?>
        <div class="row">
            <?php
                $layout_style = rem_get_option('search_results_style', '1');
                $layout_cols = rem_get_option('search_results_cols', 'col-sm-12');
                $target = rem_get_option('searched_properties_target', '');
            ?>
            <?php while ( $the_query->have_posts() ) : $the_query->the_post(); ?>
                <div id="property-<?php echo get_the_id(); ?>" class="<?php echo $layout_cols; ?>">
                    <?php do_action('rem_property_box', get_the_id(), $layout_style, $target ); ?>
                </div>
            <?php endwhile; ?>
        </div>
        <?php wp_reset_postdata(); ?>

    <?php else : ?>
        <br>
        <div class="alert with-icon alert-info" role="alert">
            <i class="icon fa fa-info"></i>
            <span style="margin-top: 12px;margin-left: 10px;"><?php echo rem_get_option('no_results_msg', 'Sorry! No Properties Found. Try Searching Again.') ?></span>
        </div>
    <?php endif;
    return ob_get_clean();
}

?>