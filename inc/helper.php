<?php
	/*
		This is helper file to allow you to easily and with no errors create pagination for search resaults
	*/
	
	/* function */
	function fmp_pagination( $options ){
		$pagination = "";
		/* default options */
		$defaults = array(
			"wrapper"			=> "%s",
			"perpage" 			=> 1000,
			"page"				=> 1,
			"total_results"		=> 0,
			"prevnext" 			=> true,
			"previous_text"		=> "Prev",
			"next_text"		    => "Next",
			"link" 				=> "%s",
			"link_text_form"	=> "%s",
			"show_total"		=> true,
			"show_results"		=> true,
			"results_form"		=> "<span class=\"fmp_showing\">Showing %start to %end of %total results</span>",
			"wrap_current"		=> "<span class=\"fmp_current\">%s</span>"
		);
		
		$options = array_merge( $defaults, $options );
		
		$total_pages = ceil($options["total_results"] / $options["perpage"]);
		
		if( $options["total_results"] > 0 ){
			/* do not allow division by zero */
			$options["perpage"] = $options["perpage"] > 0 ? $options["perpage"] : 1000;	

			/* crete page links */
			for( $i=1; $i<=$total_pages; $i++ ){
				if( $i == $options["page"] ){
					$current = str_replace( "%s", $i, $options["link_text_form"]);
					$current = str_replace( "%s", $current, $options["wrap_current"]);
					$pagination .= $current;
				}
				else{
					$link = str_replace( "%s", $i, $options["link"] );
					$link_form = str_replace( "%s", $i, $options["link_text_form"] );
					$pagination .= "<a href=\"{$link}\" class=\"fmp_page\">{$link_form}</a>";
				}
			}
			
			/* add next and previou page links */
			if( $options["prevnext"] === true ){
				if( $options["page"] > 1 ){
					$link = str_replace( "%s", ( $options["page"]-1 ), $options["link"] );
					$pagination = "<a href=\"{$link}\" class=\"fmp_page\">{$options["previous_text"]}</a>" . $pagination;
				}
				if( $options["page"] < $total_pages ){
					$link = str_replace( "%s", ( $options["page"]+1 ), $options["link"] );
					$pagination = $pagination . "<a href=\"{$link}\" class=\"fmp_page\">{$options["next_text"]}</a>";
				}				
			}
			
			/* show search results */
			if( $options["show_results"] === true ){
				$start = ($options["page"] - 1) * $options["perpage"] + 1;
				$end = ($start - 1) + $options["perpage"];
				
				if( $end > $options["total_results"] ){
					$end = $options["total_results"];
				}
				
				$results = str_replace( "%start", $start, $options["results_form"] );
				$results = str_replace( "%end", $end, $results );
				$results = str_replace( "%total", $options["total_results"], $results );
				
				$pagination .= $results;
			}
			
		}
		
		/* wrap pagination */
		if( !empty( $options["wrapper"] ) ){
			$pagination = str_replace( "%s", $pagination, $options["wrapper"] );
		}
		
		return $pagination;
	}
	
	function is_in_radius( $longitude, $latitude, $radius ){
		$distance = 6371000 * acos( cos( deg2rad($data['latitude']) ) * cos( deg2rad( $latitude ) ) * cos( deg2rad( $longitude ) - deg2rad($data['longitude']) ) + sin( deg2rad($data['latitude']) ) * sin( deg2rad( $latitude ) ) );
		if( $distance <= $radius ){
			return true;
		}
		else{
			return false;
		}		
	}

?>