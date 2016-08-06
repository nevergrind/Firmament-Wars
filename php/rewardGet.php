<?php
	function getReward($bar){
		// 2 digit
		function checkDubs($x, $y){
			if ($x === $y){
				return 1;
			}
			return 0;
		}
		// 3 digit
		function checkTrips($x, $y, $z){
			if ($x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		function checkSatanicTrips($x, $y, $z){
			if ($x === 6){
				if ($x === $y && $y === $z){
					return 1;
				}
				return 0;
			}
			return 0;
		}
		function checkDankTrips($x, $y, $z){
			if ($x === 4 && $y === 2 && $z === 0){
				return 1;
			}
			return 0;
		}
		function checkHolyTrips($x, $y, $z){
			if ($x === 7){
				if ($x === $y && $y === $z){
					return 1;
				}
				return 0;
			}
			return 0;
		}
		// 4 digit
		function checkAmericaQuads($w, $x, $y, $z){
			if ($w === 1 && $x === 7 && $y === 7 && $z === 6){
				return 1;
			}
			return 0;
		}
		function checkLeetQuads($w, $x, $y, $z){
			if ($w === 1 && $x === 3 && $y === 3 && $z === 7){
				return 1;
			}
			return 0;
		}
		function checkQuads($w, $x, $y, $z){
			if ($w === $x && $x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		function checkDoubleDubs($w, $x, $y, $z){
			if ($w === $x && $y === $z){
				return 1;
			}
			return 0;
		}
		// 5 digit
		function checkPents($v, $w, $x, $y, $z){
			if ($v === $w && $w === $x && $x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		// 6 digit
		function checkHex($u, $v, $w, $x, $y, $z){
			if ($u === $v && $v === $w && $w === $x && $x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		function checkTripleDubs($u, $v, $w, $x, $y, $z){
			if ($u === $v && $w === $x && $y === $z){
				return 1;
			}
			return 0;
		}
		// 7 digit
		function checkSects($t, $u, $v, $w, $x, $y, $z){
			if ($t === $u && $u === $v && $v === $w && $w === $x && $x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		// 8 digit
		function checkOcts($s, $t, $u, $v, $w, $x, $y, $z){
			if ($s === $t && $t === $u && $u === $v && $v === $w && $w === $x && $x === $y && $y === $z){
				return 1;
			}
			return 0;
		}
		function checkQuadDubs($s, $t, $u, $v, $w, $x, $y, $z){
			if ($s === $t && $u === $v && $w === $x && $y === $z){
				return 1;
			}
			return 0;
		}
		// start checking
		$get = (string)$bar;
		$reward = new stdClass();
		$reward->units = 0;
		$reward->msg = '';
		$reward->img = '';
		$len = strlen($get);
		$arr = str_split($get);
		// init values
		$eight = -1;
		$seven = -1;
		$six = -1;
		$five = -1;
		$four = -1;
		$three = -1;
		$two = -1;
		$one = $arr[$len - 1]*1;
		// set values
		if ($len > 7){
			$eight = $arr[$len - 8]*1;
		} 
		if ($len >= 7){
			$seven = $arr[$len - 7]*1;
		} 
		if ($len >= 6){
			$six = $arr[$len - 6]*1;
		} 
		if ($len >= 5){
			$five = $arr[$len - 5]*1;
		} 
		if ($len >= 4){
			$four = $arr[$len - 4]*1;
		}
		if ($len >= 3){
			$three = $arr[$len - 3]*1;
		}
		if ($len >= 2){
			$two = $arr[$len - 2]*1;
		}
		// check rewards
		if ($eight > -1){
			if (checkOcts($eight, $seven, $six, $five, $four, $three, $two, $one)){
				$reward->units = 50;
				$reward->msg = 'Almighty octs';
				$reward->img = 'images/chat/octs/0.gif';
			} else if (checkQuadDubs($eight, $seven, $six, $five, $four, $three, $two, $one)){
				$reward->units = 25;
				$reward->msg = 'Sick quad dubs';
				$reward->img = 'images/chat/quadDubs/0.gif';
			}
		}
		if ($seven > -1 && $reward->units === 0){
			if (checkSects($seven, $six, $five, $four, $three, $two, $one)){
				$reward->units = 42;
				$reward->msg = 'Righteous sects';
				$reward->img = 'images/chat/sects/0.gif';
			}
		} 
		if ($six > -1 && $reward->units === 0){
			if (checkHex($six, $five, $four, $three, $two, $one)){
				$reward->units = 35;
				$reward->msg = 'Savage hex';
				$reward->img = 'images/chat/hex/0.gif';
			} else if (checkTripleDubs($six, $five, $four, $three, $two, $one)){
				$reward->units = 16;
				$reward->msg = 'Triple double';
				$reward->img = 'images/chat/tripleDouble/'.mt_rand(0,1).'.jpg';
			}
		} 
		if ($five > -1 && $reward->units === 0){
			if (checkPents($five, $four, $three, $two, $one)){
				$reward->units = 27;
				$reward->msg = 'Glorious pents';
				$reward->img = 'images/chat/pents/'. mt_rand(0,2) .'.gif';
			}
		} 
		if ($four > -1 && $reward->units === 0){
			if (checkAmericaQuads($four, $three, $two, $one)){
				$reward->units = 21;
				$reward->msg = 'Liberty quads';
				$reward->img = 'images/chat/americaQuads/0.gif';
			} else if (checkLeetQuads($four, $three, $two, $one)){
				$reward->units = 21;
				$reward->msg = 'Leet quads';
				$reward->img = 'images/chat/leetQuads/'. mt_rand(0,1) .'.gif';
			} else if (checkQuads($four, $three, $two, $one)){
				$reward->units = 18;
				$reward->msg = 'Sweet quads';
				$reward->img = 'images/chat/quads/'. mt_rand(0,3) .'.gif';
			} else if (checkDoubleDubs($four, $three, $two, $one)){
				$reward->units = 7;
				$reward->msg = 'Double dubs';
				$reward->img = 'images/chat/doubleDubs/'. mt_rand(0,4) .'.gif';
			}
		} 
		if ($three > -1 && $reward->units === 0){
			if (checkHolyTrips($three, $two, $one)){
				$reward->units = 12;
				$reward->msg = 'Holy trips';
				$reward->img = 'images/chat/holyTrips/0.gif';
			} else if (checkDankTrips($three, $two, $one)){
				$reward->units = 11;
				$reward->msg = 'Dank ass trips';
				$reward->img = 'images/chat/dankTrips/0.gif';
			} else if (checkSatanicTrips($three, $two, $one)){
				$reward->units = 10;
				$reward->msg = 'Satanic trips';
				$reward->img = 'images/chat/satanicTrips/0.jpg';
			} else if(checkTrips($three, $two, $one)){
				$reward->units = 9;
				$reward->msg = 'Sick ass trips';
				$reward->img = 'images/chat/trips/'.mt_rand(0,7).'.gif';
			}
		}
		if ($two > -1 && $reward->units === 0){
			if (checkDubs($two, $one)){
				$reward->units = 3;
				$reward->msg = 'Nice dubs';
				$reward->img = 'images/chat/dubs/'.mt_rand(0,21).'.jpg';
				if ($two === 7 && $one === 7){
					$reward->img = 'images/chat/dubs/dub77.jpg';
				}
			}
		}
		return $reward;
	}
?>