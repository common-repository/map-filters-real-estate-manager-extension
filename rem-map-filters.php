<?php
/**
 * Plugin Name: Map Filters - Real Estate Manager Extension
 * Plugin URI: https://webcodingplace.com/real-estate-manager-wordpress-plugin/
 * Description: Search on Map filters for Real Estate Manager
 * Version: 1.0
 * Author: WebCodingPlace
 * Author URI: https://webcodingplace.com/
 * License: GPLv2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wcp-rem
 * Domain Path: /languages
 */

require_once('plugin.class.php');
require_once('inc/find.php');

/**
 * Iniliatizing main class object for setting up import/export
 */
if( class_exists('REM_Map_Filters')){
    $rem_filterable_grid = new REM_Map_Filters;
}

?>