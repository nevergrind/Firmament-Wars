<?php
	session_start();
	if($_SERVER["SERVER_NAME"] === "localhost"){
		error_reporting(E_ALL);
		ini_set('display_errors', true);
	} else {
		error_reporting(0);
	}
	require('php/values.php');
	
	if($_SERVER["SERVER_NAME"] !== "localhost"){
		require('php/connect1.php');
		$query = 'select count(email) from fwwhitelist where email=?';
		$stmt = $link->prepare($query);
		$stmt->bind_param('s', $_SESSION['email']);
		$stmt->execute();
		$stmt->bind_result($email);
		$count = 0;
		while ($stmt->fetch()){
			$count = $email;
		}
		if (!$count){
			echo "<center style='margin-top: 200px'>You do not have access to Firmament Wars. Firmament Wars is currently in its invite-only beta phase.</center>";
			exit();
		}
	}
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head id='head'>
	<title>Firmament Wars | Real-Time Grand Strategy Warfare</title>
	<meta charset="utf-8">
	<meta name="keywords" content="political, online, multiplayer, free, game, strategy">
	<meta name="description" content="Firmament Wars is a turn-based warfare strategy game created by Neverworks Games. Establish your nation, choose your flag, and select your dictator and vie for global domination.">
	<meta name="author" content="Joe Leonard">
	<meta name="referrer" content="always">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<meta name="viewport" content="width=1024,user-scalable=no">
	<meta name="twitter:widgets:csp" content="on">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
	<link rel='stylesheet' type='text/css' href="css/fw1.css">
	<link rel="shortcut icon" href="/images1/favicon.png">
</head>

<body id="body">
	<div id="mainWrap" class="portal">
		
		<img id="worldTitle" src="images/flat4.jpg">
	
		<div id="titleMain" class="portal">
			<header class="shadow4">
				<div id="headerWrap">
				<?php
				
				require('php/connect1.php');
				echo '<div class="accountDetails text-primary">
						<i id="musicToggle" class="fa fa-volume-up" 
						data-toggle="tooltip" 
						data-placement="right" 
						title="Toggle music"></i>';
				if (isset($_SESSION['email'])){
					// crystals
					$query = "select crystals from accounts where email='". $_SESSION['email'] ."' limit 1";
					$result = $link->query($query);
					$crystals = '';
					while($row = $result->fetch_assoc()){
						$crystals .= $row['crystals'];
					}
					
					echo 
					'<i class="fa fa-diamond" title="Never Crystals"></i>
					<span id="crystalCount" class="text-primary" title="Crystals Remaining">' .$crystals.'</span>&ensp;
					<a target="_blank" title="Manage Account" href="/account">Account</a>&ensp;
					<a target="_blank" title="Store" href="/store/">Store</a>&ensp;
					<a id="logout" href="#">Logout</a>';
				} else {
					echo 
					'<a id="login" title="Login" href="/login.php?back=/games/firmament-wars">Login</a>';
					
				}
				echo '
				</div>
				<div class="pull-right text-primary">
					<a target="_blank" href="//www.youtube.com/user/Maelfyn">
						<i class="fa fa-youtube-square text-primary pointer" title="YouTube"></i>
					</a>
					<a target="_blank" href="//twitter.com/neverworksgames">
						<i class="fa fa-twitter-square text-primary pointer" title="Twitter"></i>
					</a>
					<a target="_blank" href="//www.facebook.com/neverworksgames">
						<i class="fa fa-facebook-square text-primary pointer" title="Facebook"></i>
					</a>
					Firmament Wars
				</div>';
				
				?>
				</div>
			</header>
			
			<div id="menu" class="fw-primary">
				<div class="text-center">
					<div>
						<h2 class='header'>Firmament Wars</h2>
						<hr class="fancyhr">
					</div>
				</div>
				<div id='menuOnline'>
					<div>
					<?php
					if (isset($_SESSION['email'])){
						require('php/checkDisconnectsByAccount.php');
						
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
						}
					}
					?>
					</div>
				</div>
				<div>
					<div id="menuHead">
						<button id="refreshGames" type="button" class="titleButtons btn fwBlue btn-responsive shadow4">Refresh Games</button>
						<?php
						if (isset($_SESSION['email'])){
							echo
							'<button id="create" type="button" class="titleButtons btn fwBlue btn-responsive shadow4">Create Game</button>
							<button id="toggleNation" type="button" class="btn fwBlue btn-responsive shadow4">Configure Nation</button>';
						}
						?>
					</div>
				</div>
				<div id='refreshGameWrap'>
					<div id="menuContent" class='buffer2 shadow4'></div>
					<div id='joinGameWrap' class='buffer'>
							<div class="pull-left fw-text">
								<?php
								if (isset($_SESSION['email'])){
									echo
									'
									<hr class="fancyhr">
									<div id="joinGamePasswordWrap">
										Game <input id="joinGameName" class="joinGameInputs" type="text" maxlength="240" autocomplete="off"/>
										Password <input id="joinGamePassword" class="joinGameInputs" type="text" maxlength="240" autocomplete="off"/>
										<button id="joinGame" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Join Game</button>
									</div>';
								}
								?>
						</div>
					</div>
				</div>
			</div>
			
			<div id="titleChat" class="fw-primary text-center">
				<h2 class='header'>Global Chat Lobby</h2>
				<hr class="fancyhr">
				<div id="titleChatLog">
				<?php
					$result = mysqli_query($link, 'select count(row) count from `fwplayers` where timestamp > date_sub(now(), interval 20 second)');
					// Associative array
					while ($row = mysqli_fetch_assoc($result)){
						$total = $row['count']*1;
						echo '<div class="" >There '. ($total === 1 ? 'is' : 'are') .' '. $row["count"] . ' '. ($total === 1 ? 'person' : 'people') .' playing Firmament Wars</div>';
					}
				?>
				</div>
				
				<div id="titleChatWrap" class="titleRelWrap input-group">
					
					<?php
					if (isset($_SESSION['email'])){
						echo '
						<input id="title-chat-input" class="fw-text noselect nobg form-control" type="text" maxlength="240" autocomplete="off"/>
						<div>
							<hr class="fancyhr">
						</div>
						<span id="titleChatSend" class="input-group-addon shadow4 fwBlue">Send</span>';
					}
					?>
				</div>
			</div>
		</div>
	
		<div id="joinGameLobby" class="shadow4">
		
			<div id="lobbyLeftCol">
			
				<div id="lobbyPlayers" class="fw-primary"></div>
				
				<div id="lobbyChatLogWrap" class="fw-primary lobbyRelWrap">
					<div id="lobbyChatLog"></div>
					
					<div id="lobbyChatWrap" class="lobbyRelWrap input-group">
						<input id="lobby-chat-input" class="fw-text noselect nobg form-control" type='text' maxlength="240" autocomplete="off"/>
						<span id="lobbyChatSend" class="input-group-addon shadow4 fwBlue">Send</span>
					</div>
				</div>
				
			</div>
			
			<div id="lobbyRightCol">
				<div id="lobbyGame" class="fw-primary">
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
				
				<div id="lobbyButtons" class="fw-primary text-center lobbyRelWrap">
					<button id='startGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4'>Start Game</button>
					<button id='cancelGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4'>Exit</button>
					<div id='countdown' class='text-warning'></div>
				</div>
			</div>
			
		</div>
		
		<div id="titleViewBackdrop"></div>
		
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
				<div class='buffer w33'>
					<div class='dropdown'>
						<button class='btn btn-primary dropdown-toggle shadow4 fwDropdownButton' type='button' data-toggle='dropdown'>
							<span id='createGameMap'>Earth Alpha</span>
							<i class="fa fa-caret-down text-warning lobbyCaret"></i>
						</button>
						<ul id='mapDropdown' class='dropdown-menu fwDropdown createGameInput'>
							<li><a class='mapSelect' href='#'>Earth Alpha</a></li>
						</ul>
					</div>
				</div>
				<div class='buffer2'>
					<label class='control-label'>Map Description</label>
				</div>
				<div class='buffer'>
					<span id='createGameDescription'>Up to 8 players vie for domination in this sprawling map across six continents.</span>
					<span id='createGameGlobe' data-toggle='tooltip' title='Number of territories for this map'><i class='fa fa-globe'></i> <span id='createGameTiles'>83</span></span>
				</div>
			</div>
			<div>
				<hr class='fancyhr'>
			</div>
			<div class='text-center'>
				<button id='createGame' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Create Game Lobby</button>
			</div>
		</div>
		
		<div id="configureNation" class="fw-primary container titleModal">
			<div class="row text-center">
				<div class='col-xs-12'>
					<h2 class='header'>Configure Nation</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<img id="nationFlag" src="images/flags/<?php echo $flag; ?>">
			<div class='row fw-text'>
				<div class='col-xs-4'>
					Name:
				</div>
				<div class='col-xs-4' id="nationName">
					<div><?php echo $nation; ?></div>
				</div>
			</div>
			<div class='row fw-text'>
				<div class='col-xs-4'>
					Wins:
				</div>
				<div class='col-xs-4'>
					<?php echo $wins; ?>
				</div>
			</div>
			<div class='row fw-text'>
				<div class='col-xs-4'>
					Losses:
				</div>
				<div class='col-xs-4'>
					<?php echo $losses; ?>
				</div>
			</div>
			<div class='row fw-text'>
				<div class='col-xs-4'>
					Disconnects:
				</div>
				<div class='col-xs-4'>
					<?php echo $disconnects; ?>
				</div>
			</div>
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
							Update Flag
							<i class="fa fa-caret-down text-warning lobbyCaret"></i>
						</button>
						<ul id="flagDropdown" class="dropdown-menu fwDropdown"></ul>
					</div>
					<div id="flagPurchased" class="flagPurchaseStatus">
						<h4 class="text-center text-success shadow4">
							<i class="fa fa-check"></i>
							&ensp;Flag Purchased!
						</h4>
					</div>
					<div id="offerFlag" class="flagPurchaseStatus shadow4">
						<h5 class="text-center">Buy flag for 100 Never Crystals?</h5>
						<div class="center block">
							<button id="buyFlag" type="button" class="btn fwBlue shadow4 text-primary">
								<i class="fa fa-diamond"></i> 100
							</button>
						</div>
						<h4 class="text-center">
							<a id='purchaseCrystals' target="_blank" href="/store/">Purchase Crystals</a>
						</h4>
					</div>
					
				</div>
				<div class="col-xs-6">
					<img id="updateNationFlag" class="w100 block center" src="images/flags/<?php echo $flag; ?>">
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
		<div id="wrap-ui" class="stagBlue">
			<div id="diplomacy-ui" class="shadow4">
			</div>
			
			<div id="target-ui" class="container">
				<div class="row">
					<div id="target" class="col-xs-4 text-center no-select">
					</div>
					
					<div id="actions" class="col-xs-8 no-select">
						
						<div id="tileActions">
							<div id="menuSelect" class="container shadow4">
								<div class="row">
									<div id="gotoCommand" class="actionTabs activeTab col-xs-4 text-center" data-toggle="tooltip" title="Command your armies">
										<span class='text-hotkey'>C</span>ommand
									</div>
								
									<div id="gotoResearch" class="actionTabs col-xs-4 text-center" data-toggle="tooltip" title="Unlock new technologies">
										<span class='text-hotkey'>R</span>esearch
									</div>
								
									<div id="gotoBuild" class="actionTabs col-xs-4 text-center" data-toggle="tooltip" title="Build structures and weapons">
										<span class='text-hotkey'>B</span>uild
									</div>
								</div>
							</div>
						
							<div id="tileCommand" class="container shadow4">
							
								<div id="attack" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Move/attack with all armies">
									<div class="col-xs-8">
										<span class='text-hotkey'>A</span>ttack
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='attackCost'>7</span>
									</div>
								</div>
								
								<div id="splitAttack" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Move/attack with half of your armies">
									<div class="col-xs-8">
										<span class='text-hotkey'>S</span>plit Attack
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id="splitAttackCost">3</span>
									</div>
								</div>
								
								<div id="deploy" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Deploy up to 12 armies">
									<div class="col-xs-8">
										<span class='text-hotkey'>D</span>eploy
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='deployCost'>20</cost>
									</div>
								</div>
								
								<div id="recruit" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="">
									<div class="col-xs-8">
										R<span class='text-hotkey'>e</span>cruit
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id="recruitCost">40</span>
									</div>
								</div>
							</div>
							
							<div id="tileResearch" class="container shadow4">
								
								<div id="researchGunpowder" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Research gunpowder to unlock cannons.">
									<div class="col-xs-8">
										<span class='text-hotkey'>G</span>unpowder
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='gunpowderCost'>120</span>
									</div>
								</div>
								
								<div id="researchEngineering" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Research engineering to unlock walls and fortresses.">
									<div class="col-xs-8">
										<span class='text-hotkey'>E</span>ngineering
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='engineeringCost'>150</span>
									</div>
								</div>
								
								<div id="researchRocketry" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Research rocketry to unlock missiles.">
									<div class="col-xs-8">
										<span class='text-hotkey'>R</span>ocketry
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='rocketryCost'>250</span>
									</div>
								</div>
								
								<div id="researchAtomicTheory" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Research atomic theory to unlock nuclear weapons.">
									<div class="col-xs-8">
										<span class='text-hotkey'>A</span>tomic Theory
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='atomicTheoryCost'>500</span>
									</div>
								</div>
								
								<div id="researchFutureTech" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Research future technology.">
									<div class="col-xs-8">
										<span class='text-hotkey'>F</span>uture Tech
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='futureTechCost'>1250</span>
									</div>
								</div>
								
							</div>
							
							<div id="tileBuild" class="container shadow4">
								
								<div id="fireArtillery" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="">
									<div class="col-xs-8">
										Fire <span class='text-hotkey'>A</span>rtillery
									</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='artilleryCost'>60</span>
									</div>
								</div>
							
								<div id="upgradeTileDefense" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Bunkers upgrade the structural defense of a territory">
									<div class="col-xs-8">
									<span class='text-hotkey'>B</span>uild <span id="buildWord">Bunker</span>
									</div>
									<div class="col-xs-4 text-right">
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
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='missileCost'>150</span>
									</div>
								</div>
								
								<div id="launchNuke" class="actionButtons row" 
									data-placement="left" 
									data-toggle="tooltip" 
									title="Launch a nuclear weapon at any enemy territory. Kills 80-99% of armies and destroys all structures.">
									<div class="col-xs-8">Launch <span class='text-hotkey'>N</span>uke</div>
									<div class="col-xs-4 text-right">
										<i class="fa fa-bolt production pointer actionBolt"></i>
										<span id='nukeCost'>600</span>
									</div>
								</div>
							</div>
						
						</div>
					</div>
				</div>
			</div>
			
			<div id="resources-ui" class="container no-select shadow4">
				<div class="row">
					<div id='manpowerWrap' class="col-xs-12 no-padding manpower">
						<span data-toggle="tooltip" title="Great Generals boost army offense">
							<i class="glyphicon glyphicon-star"></i>
							<span id="oBonus">0</span> 
						</span>&nbsp;
						<span data-toggle="tooltip" title="Great Tacticians boost army defense">
							<i class="glyphicon glyphicon-star-empty"></i>
							<span id="dBonus">0</span>
						</span>
					</div>
					<div class="col-xs-12 no-padding">
						<span data-toggle="tooltip" title="Deploy armies to conquered territories">
							<i class="fa fa-angle-double-up manpower"></i> Armies <span id="manpower">0</span>
						</span>
					</div>
				</div>
				
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
					<div id="foodBarWrap" class="barWrap resourceBar">
						<div id="foodBar" class="resourceBar"></div>
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
					<div id="cultureBarWrap" class="barWrap resourceBar">
						<div id="cultureBar" class="resourceBar"></div>
					</div>
				</div>
			</div>
		</div>
		
		<table id="chat-ui" class="fw-text">
			<tr>
				<td id="chat-content" class="noselect">
				</td>
			</tr>
		</table>
		<input id="chat-input" class="fw-text noselect nobg" type='text' maxlength="240" autocomplete="off"/>
			
		<div id="worldWrap"></div>
		
		<div id="hud" class="shadow4">Select Target</div>
		<div id="victoryScreen" class="fw-primary fw-text no-select"></div>
		
	</div>

	<audio id="bgmusic" autoplay loop preload="auto"></audio>
	
	<div id="Msg" class="shadow4"></div>
	<div id="screenFlash"></div>
	<div id="overlay" class="portal"></div>
</body>
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.2/TweenMax.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/EaselJS/0.7.1/easeljs.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.15.0/plugins/EaselPlugin.min.js"></script>
<script src="js/libs/DrawSVGPlugin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/utils/Draggable.min.js"></script>
<script src="js/libs/ScrambleTextPlugin.min.js"></script>
<script src="js/libs/SplitText.min.js"></script>
<script src="js/libs/ThrowPropsPlugin.min.js"></script> 
<script src="js/libs/MorphSVGPlugin.min.js"></script> 
<script src="js/libs/AttrPlugin.min.js"></script>
<script src="js/libs/bootstrap.min.js"></script>
<script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/findShapeIndex.js"></script>

<?php
	require($_SERVER['DOCUMENT_ROOT'] . "/includes/ga.php");
?>
<script>
	if (location.host === 'nevergrind.com'){
		if (location.hash !== "#beta"){
		}
	}
	patchVersion="0-0-1";
	(function(d){
		if(location.host==='localhost' || 1){
			var _scriptLoader = [
				'core',
				'title',
				'lobby',
				'map',
				'game',
				'actions',
				'animate'
			];
		}else{
			var _scriptLoader = [
				'fw-'+patchVersion
			];
		}
		if (location.hash !== ""){
			var _scriptLoader = [
				'fw-'+patchVersion
			];
		}
		var target = d.getElementsByTagName('script')[0];
		for(var i=0, len=_scriptLoader.length; i<len; i++){
			var x=d.createElement('script');
			x.src = 'js/'+_scriptLoader[i]+'.js';
			x.async=false;
			target.parentNode.appendChild(x);
		}
	})(document);
</script>
</html>