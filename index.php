<?php
	session_start();
	
	if($_SERVER["SERVER_NAME"] === "localhost"){
		error_reporting(E_ALL);
		ini_set('display_errors', true);
	} else {
		error_reporting(0);
	}
	require('php/connect1.php');
	require('php/values.php');
	$whitelisted = 0;
	
	if($_SERVER["SERVER_NAME"] !== "localhost"){
		require('php/resetGame.php');
		$query = 'select count(email) from fwwhitelist where email=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $_SESSION['email']);
		$stmt->execute();
		$stmt->bind_result($email);
		while ($stmt->fetch()){
			$whitelisted = $email;
		}
	} else {
		$whitelisted = 1;
	}
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head id='head'>
	<title>Firmament Wars | Multiplayer Grand Strategy Warfare</title>
	<meta charset="utf-8">
	<meta name="keywords" content="risk, civilization, realtime, multiplayer, free, strategy">
	<meta name="description" content="Firmament Wars is a free online grand strategy browser game. Climb the leaderboards and compete in FFA and team modes with up to eight players for global domination!">
	<meta name="author" content="Joe Leonard">
	<meta name="referrer" content="always">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<meta name="viewport" content="width=1024,user-scalable=no">
	<meta name="twitter:widgets:csp" content="on">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<script>
		var version = "0-0-18";
	</script>
	<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css">
	<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.2.0/css/bootstrap-slider.min.css">
	<style>
		html{
			display: none;
			background: #000;
		}
	</style>
	<script>
	(function(d){
		var css = [
			'fw1'
		]
		for (var i=0, len=css.length; i<len; i++){
			var link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = 'css/' + css[i] + '.css?version=' + version;
			d.head.appendChild(link);
		}
	})(document);
	</script>
	
	<link rel="shortcut icon" href="/images1/favicon.png">
</head>

<body id="body">
		
	<div id="titleViewBackdrop"></div>

	<div id="firmamentWarsLogoWrap" class="titleBG">
		<img src="images/firmamentWarsTitle90.jpg" title="Firmament Wars Official Logo" class="titleBG fwHidden">
		
		<div id="firmamentWarsStars1" class="titleBG titleStars"></div>
		<div id="firmamentWarsStars2" class="titleBG titleStars"></div>
		<div id="firmamentWarsStars3" class="titleBG titleStars"></div>
		<div id="firmamentWarsStars4" class="titleBG titleStars"></div>
		
		<img src="images/title/FirmamentWarsTitle_globe4.png" id="titleGlobe" class="titleBG">
		<img src="images/title/firmamentWarsTitle_logo.png" id="firmamentWarsLogo" class="titleBG fwHidden">
	</div>
	
	<div id="mainWrap" class="portal">
	
		<div id="titleMain" class="portal">
			
			<header class="shadow4 text-primary">
				<?php
				
				require('php/connect1.php');
				if (isset($_SESSION['email'])){
					// crystals
					$query = "select crystals from accounts where email='". $_SESSION['email'] ."' limit 1";
					$result = $link->query($query);
					$crystals = '';
					while($row = $result->fetch_assoc()){
						$crystals .= $row['crystals'];
					}
					
					echo 
					'<span data-toggle="tooltip" data-placement="right" title="Crystals Remaining">
						<i class="fa fa-diamond" title="Never Crystals"></i>
						<span id="crystalCount" class="text-primary" >' .$crystals.'</span>
					</span>&ensp;
					<a href="/account">Account</a>&ensp;
					<a href="/store">Store</a>&ensp;';
				}
				echo
					'<a href="/forums" title="Nevergrind Browser Game Forums">Forums</a>&ensp; 
					<a href="/blog" title="Nevergrind Browser Game Development News and Articles">Blog</a>&ensp;';
					
				if (isset($_SESSION['email'])){
					echo '<a id="options" class="pointer options">Options</a>';
				}
				
				echo '
				<div class="pull-right text-primary">
					<a href="//www.youtube.com/user/Maelfyn">
						<i class="fa fa-youtube text-primary pointer"></i>
					</a>
					<a href="//www.facebook.com/neverworksgames">
						<i class="fa fa-facebook text-primary pointer"></i>
					</a>
					<a href="//twitter.com/neverworksgames">
						<i class="fa fa-twitter text-primary pointer"></i>
					</a>
					<a href="//plus.google.com/118162473590412052664">
						<i class="fa fa-google-plus text-primary pointer"></i>
					</a>
					<a href="//github.com/Maelfyn/Nevergrind">
						<i class="fa fa-github text-primary pointer"></i>
					</a>
					<a href="//reddit.com/r/firmamentwars">
						<i class="fa fa-reddit text-primary pointer"></i>
					</a>
					<a href="//goo.gl/BFsmf2">
						<i class="fa fa-linkedin text-primary pointer"></i>
					</a>
					<a href="http://www.indiedb.com/games/firmament-wars">
						<i class="fa fa-gamepad text-primary pointer"></i>
					</a>';
				if (isset($_SESSION['email'])){
					echo '&ensp;<a id="logout" class="btn fwBlue btn-responsive shadow4">Logout</a>';
				} else {
					echo '&ensp;<a id="login" class="btn btn-responsive fwBlue shadow4" href="/login.php?back=/games/firmament-wars">Login</a>';
				}
				echo '</div>';
				
				?>
			</header>
			
			<?php
			if (isset($_SESSION['email']) && $whitelisted){
				echo '<div id="titleMenu" class="fw-primary">
					<div id="menuOnline">
						<div>';
						require('php/checkDisconnectsByAccount.php');
						// remove players that left
						mysqli_query($link, 'delete from fwtitle where timestamp < date_sub(now(), interval 1 minute)');
						
						// check if nation exists; create if not
						$query = 'select count(row) from fwnations where account=?';
						$stmt = $link->prepare($query);
						$stmt->bind_param('s', $_SESSION['account']);
						$stmt->execute();
						$stmt->bind_result($dbcount);
						while($stmt->fetch()){
							$count = $dbcount;
						}
						$nation = 'Kingdom of '.ucfirst($_SESSION['account']);
						$flag = 'Default.jpg';
						if($count > 0){
							$query = "select nation, flag, wins, losses, disconnects from fwnations where account=?";
							$stmt = $link->prepare($query);
							$stmt->bind_param('s', $_SESSION['account']);
							$stmt->execute();
							$stmt->bind_result($dName, $dFlag, $wins, $losses, $disconnects);
							while($stmt->fetch()){
								$nation = $dName;
								$flag = $dFlag;
								$wins = $wins;
								$losses = $losses;
								$disconnects = $disconnects;
							}
							// init nation values
							$_SESSION['nation'] = $nation;
							$_SESSION['flag'] = $flag;
						} else {
							$query = "insert into fwnations (`account`, `nation`, `flag`) VALUES (?, '$nation', '$flag')";
							$stmt = $link->prepare($query);
							$stmt->bind_param('s', $_SESSION['account']);
							$stmt->execute();
							// show record; new nation
							$wins = 0;
							$losses = 0;
							$disconnects = 0;
							// init nation values
							$_SESSION['nation'] = $nation;
							$_SESSION['flag'] = $flag;
						}
						echo
						'
							</div>
						</div>
						<div id="menuHead">
						<button id="toggleNation" type="button" class="btn fwBlue btn-responsive shadow4">Configure Nation</button>
				</div>
						
				<hr class="fancyhr">
			
				<div id="myNationWrap" class="container tight w100">';
				require('php/myNation.php'); 
				echo '</div>
				<div class="fw-text">
					<hr class="fancyhr">
				
					<div>
						<button id="create" type="button" class="titleButtons btn fwBlue btn-responsive shadow4">Create Game</button>
					</div>
					
					<hr class="fancyhr">
					<input type="text" class="joinGameInputs fwBlueInput" id="joinGameName" placeholder="Game Name">
			
					<input type="text" class="joinGameInputs fwBlueInput" id="joinGamePassword" placeholder="Password (Optional)">
					
					<button id="joinGame" type="button" class="btn btn-md fwBlue btn-responsive shadow4">Join Game</button>
				</div>

				<div id="refreshGameWrap" class="buffer2">
					<table id="gameTable" class="table table-condensed table-borderless">
						<thead>
							<tr>
								<th class="gameTableCol1 warCells">Game Name</th>
								<th class="gameTableCol2 warCells">Map</th>
								<th class="gameTableCol3 warCells">Players</th>
							</tr>
						</thead>
						<tbody id="gameTableBody">
						</tbody>
					</table>
				</div>
			</div>
			
			<div id="titleChat" class="fw-primary text-center">
			</div>';
			}
			?>
			
			
			
			<?php
				if (isset($_SESSION['email'])){
					echo '
					<div id="titleChatPlayers" class="titlePanelLeft">
						<div id="titleChatHeader" class="chat-warning nowrap">
							<span id="titleChatHeaderChannel">global</span> 
							(<span id="titleChatHeaderCount">1</span>)
						</div>
						<div id="titleChatBody"></div>
					</div>
					<div id="titleChatLog" class="titlePanelLeft">';
					if (!$whitelisted){
						echo '<div class="chat-alert">You currently do not have access to play Firmament Wars. You must get beta access from the administrator.</div>';
					}
					$total = 0;
					$result = mysqli_query($link, 'select count(row) count from `fwtitle` where timestamp > date_sub(now(), interval 20 second)');
					while ($row = mysqli_fetch_assoc($result)){
						$total += $row['count'];
					}
					$result = mysqli_query($link, 'select count(row) count from `fwplayers` where timestamp > date_sub(now(), interval 20 second)');
					// Associative array
					while ($row = mysqli_fetch_assoc($result)){
						$total += $row['count'];
						echo '<div>There '. ($total === 1 ? 'is' : 'are') .' '. $total . ' '. ($total === 1 ? 'person' : 'people') .' playing Firmament Wars on Broken.Net</div>';
					}
				}
			?>
			</div>
			
				
			<div id="titleChatWrap">
					
				<?php
				if (isset($_SESSION['email']) && $whitelisted){
					echo '
					<div class="input-group">
						<input id="title-chat-input" class="fw-text noselect nobg form-control" type="text" maxlength="240" autocomplete="off" spellcheck="false" />
						<div id="titleChatSend" class="input-group-btn">
							<button class="btn shadow4 fwBlue">Send</button>
						</div>
					</div>';
				}
				?>
			</div>
		</div>
	
		<div id="joinGameLobby" class="shadow4">
		
			<img id="worldTitle" src="images/FlatWorld60.jpg">
		
			<div id="lobbyLeftCol">
			
				<div id="lobbyPlayers" class="fw-primary"></div>
				
				<div id="lobbyChatLogWrap" class="fw-primary lobbyRelWrap">
					<div id="lobbyChatLog"></div>
					
					<div id="lobbyChatWrap" class="lobbyRelWrap input-group">
						<input id="lobby-chat-input" class="fw-text noselect nobg form-control" type='text' maxlength="240" autocomplete="off" spellcheck="false"/>
						<span id="lobbyChatSend" class="input-group-addon shadow4 fwBlue">Chat</span>
					</div>
				</div>
				
			</div>
			
			<div id="lobbyRightCol">
			
				<div id="lobbyGame" class="fw-primary">
					<img src="images/title/firmamentWarsTitle_logo_cropped_640x206.png" id="lobbyFirmamentWarsLogo">
					<div class='text-primary text-center margin-top'>Game Name:</div> 
					<div id='lobbyGameName' class='text-center'></div>
					<div class='text-primary text-center margin-top'>Max Players:</div>
					<div id='lobbyGameMax' class='text-center'></div>
					<div class='text-primary text-center margin-top'>Map:</div>
					<div id='lobbyGameMap' class='text-center'></div>
				</div>
				
				<div id="lobbyGovernmentDescription" class="fw-primary text-center lobbyRelWrap">
					<div id="lobbyGovName" class='text-primary'>Despotism</div>
					<div id="lobbyGovPerks">
						<div>3x starting energy</div>
						<div>+50% starting armies</div>
						<div>Start With a Bunker</div>
						<div>Free Split Attack</div>
					</div>
				</div>
				
				<div id="lobbyButtonWrap" class="fw-primary text-center lobbyRelWrap">
					<button id='startGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons'>Start Game</button>
					<button id='cancelGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons'>Exit</button>
					<div id='countdown' class='text-warning'></div>
				</div>
			</div>
			
		</div>
		
		<div id='createGameWrap' class='fw-primary titleModal'>
			<h2 class='header text-center'>Create Game</h2>
			<hr class="fancyhr">
			<div id="createGameFormWrap">
				<div class='buffer2'>
					<label>Game Name</label>
				</div>
				<div class='buffer'>
					<input id='gameName' class='form-control createGameInput' type='text' maxlength='32' autocomplete='off'>
				</div>
				<div class='buffer2'>
					<label>Password (Optional)</label>
				</div>
				<div class='buffer'>
					<input id='gamePassword' class='form-control createGameInput' type='text' maxlength='32' autocomplete='off'>
				</div>
				
				<div class='buffer2'>
					<label class='control-label'>Maximum Number of Players</label>
				</div>
				
				<div class='buffer'>
					<input id='gamePlayers' type='number' class='form-control createGameInput' id='gamePlayers' value='8' min='2' max='8'>
				</div>
				
				<div class='buffer2'>
					<label class='control-label'>Map</label>
				</div>
				
				<div id="offerMap" class="pull-right text-center">
					<h5>Buy map?</h5>
					<div class="center block">
						<button id="buyMap" type="button" class="btn fwBlue shadow4 text-primary">
							<i class="fa fa-diamond"></i> 150
						</button>
					</div>
					<h4>
						<a class="fwFont" target="_blank" href="/store">Buy Crystals</a>
					</h4>
				</div>
				
				<div class='buffer w33'>
					<div class='dropdown'>
						<button class='btn btn-primary dropdown-toggle shadow4 fwDropdownButton' type='button' data-toggle='dropdown'>
							<span id='createGameMap'>Earth Alpha</span>
							<i class="fa fa-caret-down text-warning lobbyCaret"></i>
						</button>
						<ul id='mapDropdown' class='dropdown-menu fwDropdown createGameInput'>
						</ul>
					</div>
				</div>
				
				<div class='buffer2'>
					<label class='control-label'>Map Details</label>
				</div>
				<div class='buffer'>
					<span data-toggle='tooltip' title='Max players on this map'>
						<i class='fa fa-users'></i>
						<span id='createGamePlayers'>8</span>
					</span>&ensp;
					<span data-toggle='tooltip' title='Number of territories on this map'>
						<i class='fa fa-globe'></i> 
						<span id='createGameTiles'>83</span>
					</span>
					<span id="mapStatus" class="text-success">
						<i class="fa fa-check"></i> Free Map
					</span>
				</div>
			</div>
			<div>
				<hr class='fancyhr'>
			</div>
			<div class='text-center'>
				<button id='createGame' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Create Game</button>
				<button id='cancelCreateGame' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Cancel</button>
			</div>
		</div>
		
		<div id="configureNation" class="fw-primary container titleModal">
			<div class="row text-center">
				<div class='col-xs-12'>
					<h2 class='header'>Configure Nation</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<?php require('php/myNation.php'); ?>
			<div class="row text-center buffer2">
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<h2 class='header'>Update Name</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12">
					<div class="input-group">
						<input id="updateNationName" class="form-control" type="text" maxlength="32" autocomplete="off" size="24" aria-describedby="updateNationNameStatus" placeholder="Enter New Nation Name">
						<span class="input-group-btn">
							<button id="submitNationName" class="btn fwBlue shadow4" type="button">
								Update Nation Name
							</button>
						</span>
					</div>
				</div>
			</div>
			<div class="row text-center">
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<h2 class='header'>Update Flag</h2>
					<hr class="fancyhr">
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-6 text-center">
					<div class="dropdown">
						<button class="btn dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">
							<span id="selectedFlag"><?php 
								if (isset($_SESSION['flag'])){
									$flagShort = explode(".", $_SESSION['flag']);
									echo $flagShort[0];
								}
								?></span>
							<i class="fa fa-caret-down text-warning lobbyCaret"></i>
						</button>
						<ul id="flagDropdown" class="dropdown-menu fwDropdown"></ul>
					</div>
					<div id="flagPurchased" class="flagPurchasedStatus">
						<h4 class="text-center text-success shadow4">
							<i class="fa fa-check"></i>
							&ensp;Flag Unlocked!
						</h4>
					</div>
				</div>
				<div class="col-xs-6">
					
					<img id="updateNationFlag" class="w100 block center" src="images/flags/<?php 
						if (isset($_SESSION['flag'])){ echo $flag; }
					?>">
					<div id="offerFlag" class="flagPurchasedStatus shadow4">
						<h5 class="text-center">Buy flag?</h5>
						<div class="center block">
							<button id="buyFlag" type="button" class="btn fwBlue shadow4 text-primary">
								<i class="fa fa-diamond"></i> 100
							</button>
						</div>
						<h4 class="text-center">
							<a class='fwFont' target="_blank" href="/store">Buy Crystals</a>
						</h4>
					</div>
				</div>
			</div>
			<div class='row buffer text-center'>
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<button id="configureNationDone" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Done</button>
				</div>
			</div>
		</div>
		
	</div>
	
	<div id="gameWrap">
		
		<div id="ui2" class="stagBlue">
		
			<div id="ui2-head" class="stagBlue">
				<span id='manpowerWrap' class="manpower pull-left">
					<span data-toggle="tooltip" 
						data-placement="bottom"
						title="Great Generals boost army offense">
						<i class="glyphicon glyphicon-star"></i>
						<span id="oBonus">0</span> 
					</span>&nbsp;
					<span data-toggle="tooltip"  
						data-placement="bottom"
						title="Great Tacticians boost army defense" class="marginLeft">
						<i class="glyphicon glyphicon-star-empty"></i>
						<span id="dBonus">0</span>
					</span>
				</span>
				<span class="marginLeft">
					<span data-toggle="tooltip"  
						data-placement="bottom" 
						title="Deploy armies to conquered territories">
						<i class="fa fa-angle-double-up manpower"></i> Armies <span id="manpower">0</span>
					</span>
				</span>
			</div>
			
			<div id="target-ui" class="container w100">
				<div class="row tight">
					<div id="targetFlag" class="col-xs-4 text-center no-select tight">
					</div>
					<div id="targetName" class="col-xs-8 text-center no-select shadow4 tight">
					</div>
				</div>
			</div>
						
			<div id="tileActions" class="container w100">
				
				<div id="attack" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Move/attack with all armies">
					<div class="col-xs-8">
						<span class='text-hotkey'>A</span>ttack
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='attackCost'>10</span>
					</div>
				</div>
				
				<div id="splitAttack" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Move/attack with half of your armies">
					<div class="col-xs-8">
						<span class='text-hotkey'>S</span>plit Attack
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id="splitAttackCost">5</span>
					</div>
				</div>
				
				<div id="deploy" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Deploy up to 12 armies">
					<div class="col-xs-8">
						<span class='text-hotkey'>D</span>eploy
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='deployCost'>10</cost>
					</div>
				</div>
				
				<div id="recruit" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="">
					<div class="col-xs-8">
						<span class='text-hotkey'>R</span>ecruit
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id="recruitCost">30</span>
					</div>
				</div>
				
				<div id="fireCannons" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="">
					<div class="col-xs-8">
						Fire <span class='text-hotkey'>C</span>annons
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='cannonsCost'>40</span>
					</div>
				</div>
			
				<div id="upgradeTileDefense" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Bunkers upgrade the structural defense of a territory">
					<div class="col-xs-8">
					<span class='text-hotkey'>B</span>uild <span id="buildWord">Bunker</span>
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id="buildCost">80</span>
					</div>
				</div>
				
				<div id="launchMissile" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="">
					<div class="col-xs-8">
						Launch <span class='text-hotkey'>M</span>issile
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='missileCost'>60</span>
					</div>
				</div>
				
				<div id="launchNuke" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Launch a nuclear weapon at any enemy territory. Kills 80-99% of armies and destroys all structures.">
					<div class="col-xs-8">Launch <span class='text-hotkey'>N</span>uke</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='nukeCost'>400</span>
					</div>
				</div>
			
			</div>
			
			<div id="tileResearch" class="container w100">
				<div id="researchHead" class="text-center shadow4">Research</div>
				
				<div id="researchGunpowder" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Research gunpowder to unlock cannons.">
					<div class="col-xs-8">
						<span class='text-hotkey'>G</span>unpowder
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='gunpowderCost'>80</span>
					</div>
				</div>
				
				<div id="researchEngineering" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Research engineering to unlock walls and fortresses.">
					<div class="col-xs-8">
						<span class='text-hotkey'>E</span>ngineering
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='engineeringCost'>120</span>
					</div>
				</div>
				
				<div id="researchRocketry" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Research rocketry to unlock missiles.">
					<div class="col-xs-8">
						Roc<span class='text-hotkey'>k</span>etry
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='rocketryCost'>200</span>
					</div>
				</div>
				
				<div id="researchAtomicTheory" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Research atomic theory to unlock nuclear weapons.">
					<div class="col-xs-8">
						A<span class='text-hotkey'>t</span>omic Theory
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='atomicTheoryCost'>250</span>
					</div>
				</div>
				
				<div id="researchFutureTech" class="actionButtons row" 
					data-placement="left" 
					data-toggle="tooltip" 
					title="Research future technology.">
					<div class="col-xs-8">
						<span class='text-hotkey'>F</span>uture Tech
					</div>
					<div class="col-xs-4 text-right energyCost">
						<i class="fa fa-bolt production pointer actionBolt"></i>
						<span id='futureTechCost'>1000</span>
					</div>
				</div>
			</div>
			
		</div>
		
			
		<div id="resources-ui" class="container no-select shadow4 stagBlue">
			
			<div class="row">
				<div class="col-xs-12 no-padding production">
					<span data-toggle="tooltip" title="Energy is required to perform actions">
						<i class="fa fa-bolt"></i> Energy 
					</span>
					<span data-toggle="tooltip" title="Energy Bonus">
						+<span id="turnBonus">0</span>%
					</span>
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div class="resourceIndicator">
						<span id="production">0</span> 
						<span data-toggle="tooltip" title="Energy per turn">
							(+<span id="sumProduction">0</span>)
						</span>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding food">
					<span data-toggle="tooltip" title="Food milestones produce armies">
						<i class="glyphicon glyphicon-apple"></i> Food 
					</span>
					<span data-toggle="tooltip" title="Food Bonus">
						+<span id="foodBonus">0</span>%
					</span>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div class="resourceIndicator">
						<span id="food">0</span>/<span id="foodMax">25</span> 
						<span data-toggle="tooltip" title="Food per turn">
							(+<span id="sumFood">0</span>)
						</span>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div id="foodBarWrap" class="barWrap resourceBar">
						<div id="foodBar" class="resourceBar"></div>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding culture">
					<span data-toggle="tooltip" title="Culture milestones produce special rewards"><i class="fa fa-flag"></i> Culture</span>
					<span data-toggle="tooltip" title="Culture Bonus">
						+<span id="cultureBonus">0</span>%
					</span>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div class="resourceIndicator">
						<span id="culture">0</span>/<span id="cultureMax">400</span> 
						<span data-toggle="tooltip" title="Culture per turn">
							(+<span id="sumCulture">0</span>)
						</span>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div id="cultureBarWrap" class="barWrap resourceBar">
						<div id="cultureBar" class="resourceBar"></div>
					</div>
				</div>
			</div>
		</div>
		
		<div id="diplomacy-ui" class="shadow4 stagBlue"></div>
		
		<table id="chat-ui" class="fw-text">
			<tr>
				<td id="chat-content" class="noselect">
				</td>
			</tr>
		</table>
		<input id="chat-input" class="fw-text noselect nobg" type='text' maxlength="240" autocomplete="off" spellcheck="false"/>
			
		<div id="worldWrap">
			<div id="worldWater1"></div>
			<div id="worldWater2"></div>
			<div id="worldWater3"></div>
		</div>
		
		<div id="hud" class="shadow4">Select Target</div>
		<div id="victoryScreen" class="fw-primary fw-text no-select"></div>
		
	</div>

	<audio id="bgmusic" autoplay loop preload="auto"></audio>
	
	<div id="optionsModal" class='fw-primary titleModal'>
		<h2 class='header text-center'>Options</h2>
		<hr class="fancyhr">
		<div id="optionsFormWrap" class="container w100">
		
			<div class='row buffer2'>
				<div class='col-xs-4'>
					Music Volume
				</div>
				<div class='col-xs-8 text-right'>
					<input id="musicSlider" class="sliders" type="text"/>
				</div>
			</div>
			
			<div class='row buffer2'>
				<div class='col-xs-4'>
					Sound Effect Volume
				</div>
				<div class='col-xs-8 text-right'>
					<input id="soundSlider" class="sliders" type="text"/>
				</div>
			</div>
			
		</div>
		
		<div class="buffer2">
			<hr class='fancyhr'>
		</div>
		<div class='text-center'>
			<button id='optionsDone' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Done</button>
		</div>
	</div>
	
	<div id="Msg" class="shadow4"></div>
	<div id="screenFlash"></div>
	<div id="overlay" class="portal"></div>
</body>

<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.2/TweenMax.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
<script src="js/libs/DrawSVGPlugin.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/utils/Draggable.min.js"></script>
<script src="js/libs/ScrambleTextPlugin.min.js"></script>
<script src="js/libs/SplitText.min.js"></script>
<script src="js/libs/ThrowPropsPlugin.min.js"></script> 
<script src="js/libs/MorphSVGPlugin.min.js"></script> 
<script src="js/libs/autobahn.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/plugins/AttrPlugin.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/9.2.0/bootstrap-slider.min.js"></script>

<?php
	require($_SERVER['DOCUMENT_ROOT'] . "/includes/ga.php");
?>
<script>
	(function(d){
		if(location.host==='localhost' || 1){
			var _scriptLoader = [
				'core',
				'title',
				'lobby',
				'ws',
				'audio',
				'map',
				'game',
				'actions',
				'animate'
			];
		} else {
			var _scriptLoader = [
				'firmament-wars_0-0-8'
			];
		}
		for(var i=0, len=_scriptLoader.length; i<len; i++){
			var x = d.createElement('script');
			x.src = 'js/'+_scriptLoader[i]+'.js?v=' + version;
			x.async = false;
			d.head.appendChild(x);
		}
	})(document);
</script>
</html>