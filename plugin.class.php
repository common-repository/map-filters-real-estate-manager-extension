<?php
/**
* Class to handle filteration on maps
*/
class REM_Map_Filters
{
	
	function __construct(){
		add_action( 'admin_notices', array($this, 'check_if_rem_activated') );

		add_shortcode( 'rem_map_search_form', array($this, 'render_search_form') );
		add_shortcode( 'rem_map_area', array($this, 'render_map') );
		add_shortcode( 'rem_map_search_results', array($this, 'render_results') );
		add_shortcode( 'rem_map_filters', array($this, 'render_styles') );

		add_action( 'wp_ajax_rem_map_filters', array($this, 'rem_map_filters') );
		add_action( 'wp_ajax_nopriv_rem_map_filters', array($this, 'rem_map_filters') );
	}

	function check_if_rem_activated() {
		if (!class_exists('WCP_Real_Estate_Management')) { ?>
		    <div class="notice notice-info is-dismissible">
		        <p>Please install and activate <a target="_blank" href="https://wordpress.org/plugins/real-estate-manager/">Real Estate Manager</a> for using <strong>Google Map Filters</strong></p>
		    </div>
		<?php }
	}

	function render_search_form($attrs){
		// $default_icon = rem_get_option('maps_property_image', REM_URL . '/assets/images/maps/cottage-pin.png');
		// $default_icon_h = rem_get_option('maps_property_image_hover', REM_URL . '/assets/images/maps/cottage-hover-pin.png');		
		extract( shortcode_atts( array(
			'fields_to_show' => 'property_address,search,property_type,property_country,property_purpose,property_price',
			'columns' => '6',
			'search_btn_text' => __( 'Search', 'real-estate-manager' ),
			'reset_btn_text' => '',
			'fixed_fields' => '',
			'disable_eq_height' => '',
			'agent_id' => '',
			'fields_margin' => '0 0 10px 0',
			'icons_by_meta'	=> '',
			'icons_data'	=> '',
	        'slider_bg_color'  	=> '',
	        'slider_handle_color'  	=> '',
	        'slider_badge_bg_color'  	=> '',
	        'slider_badge_text_color'  	=> '',			
		), $attrs ) );

		rem_load_bs_and_fa();
        rem_load_basic_styles();
        wp_enqueue_style( 'rem-archive-property-css', REM_URL . '/assets/front/css/archive-property.css' );


		wp_enqueue_style( 'rem-nouislider-css', REM_URL . '/assets/front/lib/nouislider.min.css' );
		wp_enqueue_script( 'rem-nouislider-drop', REM_URL . '/assets/front/lib/nouislider.all.min.js', array('jquery'));
		wp_enqueue_script( 'rem-match-height', REM_URL . '/assets/front/lib/jquery.matchheight-min.js', array('jquery'));
        $script_settings = array(
            'price_min'         => rem_get_option('minimum_price', '350'),
            'price_max'         => rem_get_option('maximum_price', '45000'), 
            'price_min_default' => rem_get_option('default_minimum_price', '7000'), 
            'price_max_default' => rem_get_option('default_maximum_price', '38500'), 
            'price_step'        => rem_get_option('price_step', '10'),
            'currency_symbol'   => rem_get_currency_symbol(),
            'thousand_separator'=> rem_get_option('thousand_separator', ''),
            'decimal_separator' => rem_get_option('decimal_separator', ''),
            'decimal_points'    => rem_get_option('decimal_points', '0'),
        );

		wp_enqueue_script( 'rem-map-form', plugin_dir_url( __FILE__ ).'js/form.js', array('jquery') );
		wp_localize_script( 'rem-map-form', 'rem_map_form_data', $script_settings );

		$icons_array = explode(",", $icons_data);
		$map_icons = array();

		foreach ($icons_array as $icon_meta) {
			$icon_meta_arr = explode("|", $icon_meta);
			$map_icons[trim($icon_meta_arr[0])] = array(
				'static' => (isset($icon_meta_arr[1])) ? trim($icon_meta_arr[1]) : '',
				'hover' => (isset($icon_meta_arr[2])) ? trim($icon_meta_arr[2]) : '',
			);
		}

		ob_start();
		
			include 'inc/render-search-form.php';

		return ob_get_clean();		
	}

	function render_map($attrs){
		extract( shortcode_atts( array(
			'address' => 'USA',
			'lat' => '',
			'long' => '',
			'zoom' => '5',
			'map_styles' => stripcslashes(rem_get_option('maps_styles')),
			'map_height' => '500px',
		), $attrs ) );


		$maps_api = apply_filters( 'rem_maps_api', 'AIzaSyCP_Lm-QHmD4wfhJMHfpokd25lfpZ2_sak' );

		if (is_ssl()) {
		    wp_enqueue_script( 'rem-google-maps', 'https://maps.googleapis.com/maps/api/js?key='.$maps_api.'&libraries=places' );
		} else {
		    wp_enqueue_script( 'rem-google-maps', 'http://maps.googleapis.com/maps/api/js?key='.$maps_api.'&libraries=places' );
		}
		    // wp_enqueue_script( 'rem-google-maps', 'https://maps.googleapis.com/maps/api/js?libraries=places&amp;sensor=false' );

		wp_enqueue_script( 'rem-infobox-js', plugin_dir_url( __FILE__ ).'js/infobox.min.js', array('jquery') );
		wp_enqueue_script( 'rem-oms-js', plugin_dir_url( __FILE__ ).'js/oms.min.js', array('jquery') );
		wp_enqueue_script( 'rem-clusters-js', plugin_dir_url( __FILE__ ).'js/clusters.js', array('jquery') );
		wp_enqueue_style( 'rem-mapglobal-css', plugin_dir_url( __FILE__ ).'css/style.css' );

        $script_settings = array(
            'address'         => $address,
            'zoom'         => $zoom,
            'lat'         => $lat,
            'long'         => $long,
            'map_styles'         => $map_styles,
        );

		wp_enqueue_script( 'rem-map-area', plugin_dir_url( __FILE__ ).'js/map.js', array('jquery') );
		wp_localize_script( 'rem-map-area', 'rem_maps_data', $script_settings );		    


		ob_start();

			include 'inc/render-map.php';

		return ob_get_clean();	
	}

	function render_results($attrs){
		extract( shortcode_atts( array(
			'title' => '',
			'title_wrap' => '<h2>%title%</h2>'
		), $attrs ) );    


		ob_start(); ?>

			<?php if($title != ''){
				echo str_replace("%title%", $title, $title_wrap);
			} ?>
			<div class="ich-settings-main-wrap">
				<div class="property-search-results"></div>
			</div>
	
		<?php return ob_get_clean();	
	}

	function render_property_search_fields($field, $display = 'widget'){
		if ($field['key'] == 'property_area' || $field['key'] == 'property_bedrooms' || $field['key'] == 'property_bathrooms') {
			$meta_key = array(
				'property_area' => 'search_area_options',
				'property_bedrooms' => 'search_bedrooms_options',
				'property_bathrooms' => 'search_bathrooms_options',
			);
			if (rem_get_option($meta_key[$field['key']], '') != '') { ?>
				<select class="form-control" name="<?php echo $field['key']; ?>" id="<?php echo $field['key']; ?>">
					<option value="">-- <?php echo ($display == 'widget') ? __( 'Any', 'real-estate-manager' ) : $field['title']; ?> --</option>
						<?php
							$options = explode("\n", rem_get_option($meta_key[$field['key']]));
							foreach ($options as $title) {
								$title = stripcslashes($title);
								$selected = '';
								if(isset($_GET[$field['key']]) && $_GET[$field['key']] == trim($title)){
									$selected = 'selected';
								}
								echo '<option value="'.trim($title).'" '.$selected.'>'.$title.'</option>';
							}
						?>
				</select>
			<?php } else { ?>
				<input class="form-control" type="text" placeholder="<?php echo $field['title']; ?>" name="<?php echo $field['key']; ?>" id="<?php echo $field['key']; ?>" value="<?php echo (isset($_GET[$field['key']])) ? esc_attr( $_GET[$field['key']] ) : '' ; ?>"/>
			<?php }		
		} elseif ($field['key'] == '') { ?>
			
		<?php } else {
			if ($field['type'] == 'select') { 
				if (class_exists('REM_CONDITIONAL_FIELDS')) {
					$existing_options = rem_conditional_start()->values_in_posts();
				}
				?>
				<select class="form-control" name="<?php echo $field['key']; ?>" id="<?php echo $field['key']; ?>">
					<option value="">-- <?php echo ($display == 'widget') ? __( 'Any', 'real-estate-manager' ) : $field['title']; ?> --</option>
						<?php
							foreach ($field['options'] as $title) {
								$title = stripcslashes($title);
								$selected = '';
								if(isset($_GET[$field['key']]) && $_GET[$field['key']] == trim($title)){
									$selected = 'selected';
								}
								if (class_exists('REM_CONDITIONAL_FIELDS') ) {
									if ( in_array($title, $existing_options[$field['key']] ) ) {
										
										echo '<option value="'.trim($title).'" '.$selected.'>'.$title.'</option>';
									}
								}else {
									
									echo '<option value="'.trim($title).'" '.$selected.'>'.$title.'</option>';
								}
							}
						?>
				</select>
			<?php } else { ?>
				<input placeholder="<?php echo $field['title']; ?>" class="form-control" type="<?php echo $field['type']; ?>" name="<?php echo $field['key']; ?>" id="<?php echo $field['key']; ?>" value="<?php echo (isset($_GET[$field['key']])) ? esc_attr( $_GET[$field['key']] ) : '' ; ?>"/>
			<?php }
		}
	}

	function rem_map_filters(){
		$args = rem_get_search_query($_REQUEST);

		$icons_data = json_decode(stripcslashes($_REQUEST['icons_data']), true);
		$icons_by_meta = $_REQUEST['icons_by_meta'];
		$res = rem_search_properties_on_map($args, $icons_data, $icons_by_meta);	
		$properties = rem_search_properties_off_map($args);	

		$response = array(
			"pagination"	=> '',
			"results" 		=> $res,
			"properties" 		=> $properties
		);
		
		echo json_encode($response);	

		die(0);	
	}

	function render_styles($attrs){
		extract( shortcode_atts( array(
			'fields_to_show' => '',
			'columns' => '',
			'search_btn_text' => __( 'Search', 'real-estate-manager' ),
			'reset_btn_text' => '',
			'fixed_fields' => '',
			'disable_eq_height' => '',
			'agent_id' => '',
			'fields_margin' => '0 0 10px 0',
			'icons_by_meta'	=> '',
			'icons_data'	=> '',
	        'slider_bg_color'  	=> '',
	        'slider_handle_color'  	=> '',
	        'slider_badge_bg_color'  	=> '',
	        'slider_badge_text_color'  	=> '',
			
			'style'	=> '1',

			'address' => 'USA',
			'lat' => '',
			'long' => '',
			'zoom' => '5',
			'map_styles' => '',
			'map_height' => '500px',
		), $attrs ) );
		ob_start();
		if (file_exists(plugin_dir_path( __FILE__ ).'inc/styles/style'.$style.'.php')) {
			include plugin_dir_path( __FILE__ ).'inc/styles/style'.$style.'.php';
		} else {
			echo 'Style '.$style.' not found!';
		}
		return ob_get_clean();
	}
}
?>