<?php
	session_start();
	if (!isset($_SESSION['fwpaid'])){
		$_SESSION['fwpaid'] = 0;
	}
	if($_SERVER["SERVER_NAME"] === "localhost"){
		error_reporting(E_ALL);
		ini_set('display_errors', true);
	} else {
		error_reporting(0);
	}
	require('php/connect1.php');
	require('php/values.php');
	
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head id='head'>
	<title>Firmament Wars | Multiplayer Strategy | Realtime Risk-Like Warfare</title>
	<meta charset="utf-8">
	<meta name="keywords" content="risk, civilization, starcraft, multiplayer, pol, strategy, gaming">
	<meta name="description" content="Firmament Wars is a browser-based politically incorrect Risk-like strategy game with realtime combat in FFA, ranked, and team modes!">
	<meta name="author" content="Joe Leonard">
	<meta name="referrer" content="always">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<meta name="viewport" content="width=1024,user-scalable=no">
	<meta name="twitter:widgets:csp" content="on">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/bootstrap-slider.min.css">
	<link rel="stylesheet" href="css/font-awesome.min.css">
	<link rel="stylesheet" href="css/firmament-wars.css?v=0-0-40">
	<script>
		version = '0-0-40'; 
	</script>
	<link rel="shortcut icon" href="/images1/favicon.png">
</head>

<body id="body">
		
	<div id="titleViewBackdrop"></div>

	<div id="firmamentWarsLogoWrap">
		<img src="images/title/firmament-wars-background-2-75.jpg" id="firmamentWarsBG" title="Firmament Wars Background">
		<img src="images/title/firmament-wars-logo-1280.png" id="firmamentWarsLogo" title="Firmament Wars Logo">
	</div>
	
	<div id="mainWrap" class="portal">
	
		<div id="titleMain" class="portal">
			
			<header id="document" class="shadow4 text-primary">
				<?php
				require('php/connect1.php');
				// check if paid
				if (!$_SESSION['fwpaid']){
					$stmt = $link->prepare("select account from fwpaid where account=? limit 1");
					$stmt->bind_param('s', $_SESSION['account']);
					$stmt->execute();
					$stmt->bind_result($dbAccount);
					$stmt->store_result();
					// check if the game exists at all
					if ($stmt->num_rows){
						$_SESSION['fwpaid'] = 1;
					}
				}
				// load/init nation data
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
				$_SESSION['rating'] = 1500;
				$_SESSION['totalGames'] = 0;
				$_SESSION['wins'] = 0;
				$_SESSION['losses'] = 0;
				$_SESSION['teamWins'] = 0;
				$_SESSION['teamLosses'] = 0;
				$_SESSION['rankedWins'] = 0;
				$_SESSION['rankedLosses'] = 0;
				$_SESSION['disconnects'] = 0;
				$_SESSION['disconnectRate'] = 0;
				$nation = 'Kingdom of '. ucfirst($_SESSION['account']);
				$flag = 'Algeria.jpg';
				if($count > 0){
					$query = "select row, nation, flag, rating, wins, losses, teamWins, teamLosses, rankedWins, rankedLosses, disconnects from fwnations where account=?";
					$stmt = $link->prepare($query);
					$stmt->bind_param('s', $_SESSION['account']);
					$stmt->execute();
					$stmt->bind_result($dRow, $dName, $dFlag, $rating, $wins, $losses, $teamWins, $teamLosses, $rankedWins, $rankedLosses, $disconnects);
					while($stmt->fetch()){
						$_SESSION['nationRow'] = $dRow;
						$nation = $dName;
						$flag = $dFlag;
						$_SESSION['rating'] = $rating;
						$_SESSION['totalGames'] = $wins + $losses + $rankedWins + $rankedLosses + $disconnects;
						$_SESSION['wins'] = $wins;
						$_SESSION['losses'] = $losses;
						$_SESSION['teamWins'] = $teamWins;
						$_SESSION['teamLosses'] = $teamLosses;
						$_SESSION['rankedWins'] = $rankedWins;
						$_SESSION['rankedLosses'] = $rankedLosses;
						$_SESSION['disconnects'] = $disconnects;
						$_SESSION['disconnectRate'] = $_SESSION['totalGames'] === 0 ? 0 : round(($_SESSION['disconnects'] / $_SESSION['totalGames']) * 100) ;
					}
					// init nation values
					$_SESSION['rating'] = $rating;
					$_SESSION['nation'] = $nation;
					$_SESSION['flag'] = $flag;
				} else {
					$query = "insert into fwnations (`account`, `nation`, `flag`) VALUES (?, '$nation', '$flag')";
					$stmt = $link->prepare($query);
					$stmt->bind_param('s', $_SESSION['account']);
					$stmt->store_result();
					$stmt->execute();
					// init nation values
					$_SESSION['nation'] = $nation;
					$_SESSION['flag'] = $flag;
					$_SESSION['nationRow'] = $stmt->insert_id;
					// add ribbon
				}
				require $_SERVER['DOCUMENT_ROOT']. '/games/firmament-wars/php/addRibbon.php';
				addRibbon(1);
				$arr = explode(".", $_SESSION['flag']);
				$_SESSION['flagShort'] = $arr[0];
				$_SESSION['flagClass'] = str_replace(" ", "-", $arr[0]);
				
				
				if (isset($_SESSION['email'])){
					// fwnation data
					$query = "select nation, flag, rating, wins, losses, teamWins, teamLosses, rankedWins, rankedLosses, disconnects from fwnations where account=?";
					$stmt = $link->prepare($query);
					$stmt->bind_param('s', $_SESSION['account']);
					$stmt->execute();
					$stmt->bind_result($dName, $dFlag, $rating, $wins, $losses, $teamWins, $teamLosses, $rankedWins, $rankedLosses, $disconnects);
					while ($stmt->fetch()){
						$nation = $dName;
						$flag = $dFlag;
						$_SESSION['rating'] = $rating;
						$_SESSION['totalGames'] = $wins + $losses + $rankedWins + $rankedLosses + $disconnects;
						$_SESSION['wins'] = $wins;
						$_SESSION['losses'] = $losses;
						$_SESSION['teamWins'] = $teamWins;
						$_SESSION['teamLosses'] = $teamLosses;
						$_SESSION['rankedWins'] = $rankedWins;
						$_SESSION['rankedLosses'] = $rankedLosses;
						$_SESSION['disconnects'] = $disconnects;
						$_SESSION['disconnectRate'] = $_SESSION['totalGames'] === 0 ? 0 : round(($_SESSION['disconnects'] / $_SESSION['totalGames']) * 100) ;
					}
					
					echo 
					'<a href="/account" class="btn fwBlue btn-responsive shadow4" title="Manage Account">'. $_SESSION['account'] .'</a>&ensp;';
				} else {
					$_SESSION['rating'] = 1500;
					$_SESSION['totalGames'] = 0;
					$_SESSION['wins'] = 0;
					$_SESSION['losses'] = 0;
					$_SESSION['teamWins'] = 0;
					$_SESSION['teamLosses'] = 0;
					$_SESSION['rankedWins'] = 0;
					$_SESSION['rankedLosses'] = 0;
					$_SESSION['disconnects'] = 0;
					$_SESSION['disconnectRate'] = 0;
				}
				?>
					<a href="/forums" title="Nevergrind Browser Game Forums">Forums</a>&ensp; 
					<a href="/blog/about-firmament-wars/" target="_blank" title="Nevergrind Browser Game Development News and Articles">How to Play</a>&ensp;
					<i id="options" class="pointer options fa fa-volume-up"></i>
				<div class="pull-right text-primary">
					<a href="//www.youtube.com/user/Maelfyn">
						<i class="fa fa-youtube text-primary pointer"></i>
					</a>
					<a href="//www.facebook.com/neverworksgames">
						<i class="fa fa-facebook text-primary pointer"></i>
					</a>
					<a href="//twitter.com/maelfyn">
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
					</a>
				<?php
				if (isset($_SESSION['email'])){
					echo '&ensp;<a id="logout" class="btn fwBlue btn-responsive shadow4">Logout</a>';
				} else {
					echo '&ensp;<a id="login" class="btn btn-responsive fwBlue shadow4" href="/login.php?back=/games/firmament-wars">Login</a>';
				}
				?>
				</div>
				
			</header>
			
			<?php
			$currentPlayers = 0;
			if (isset($_SESSION['account'])){
				echo '<div id="titleMenu" class="fw-primary">
					<div id="menuOnline">
						<div>';
						echo
						'
							</div>
						</div>
					<div id="menuHead">
						<button id="toggleNation" type="button" class="btn fwBlue btn-responsive shadow4">Configure Nation</button>
						<button id="leaderboardBtn" type="button" class="btn fwBlue btn-responsive shadow4">Leaderboard</button>';
						if (!$_SESSION['fwpaid'] && isset($_SESSION['account'])){
							echo '
							<button type="button" class="unlockGameBtn btn fwGreen btn-responsive shadow4">Unlock Complete Game</button>';
						}
					echo '</div>
						
				<hr class="fancyhr">
			
				<div id="myNationWrap" class="container tight w100">';
				require('php/myNation.php'); 
				echo '</div>
				<div class="fw-text">
					<hr class="fancyhr">
				
					<div>
						<div class="btn-group" class="fwBlue">
							<button id="createGameBtn" type="button" class="titleButtons btn btn-responsive shadow4 dropdown-toggle fwDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Create Game <span class="titleCaret caret chat-warning"></span>
							</button>
							<ul class="dropdown-menu fwDropdown">
								<li id="create" class="gameSelect">
									<a href="#">Free For All</a>
								</li>';
								if (isset($_SESSION['email'])){
									echo '<li id="createRankedBtn" class="gameSelect">
										<a href="#">Ranked Match</a>
									</li>';
								}
								echo '<li id="createTeamBtn" class="gameSelect">
									<a href="#">Team Game</a>
								</li>
							</ul>
						</div>
						
						<div class="btn-group" class="fwBlue">
							<button id="autoJoinBtn" type="button" class="titleButtons btn btn-responsive shadow4 dropdown-toggle fwDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Auto Join Game <span class="titleCaret caret chat-warning"></span>
							</button>
							<ul class="dropdown-menu fwDropdown">
								<li id="autoJoinGame" class="gameSelect">
									<a href="#">Free For All</a>
								</li>';
								if (isset($_SESSION['email'])){
									echo '<li id="joinRankedGame" class="gameSelect">
										<a href="#">Ranked Match</a>
									</li>';
								}
								echo '<li id="joinTeamGame" class="gameSelect">
									<a href="#">Team Game</a>
								</li>
							</ul>
						</div>
						<button id="joinPrivateGameBtn" type="button" class="btn fwBlue btn-responsive shadow4">Join Private Game</button>
					</div>
					
					<hr class="fancyhr">
				</div>

				<div id="refreshGameWrap" class="buffer2">
					<table id="gameTable" class="table table-condensed table-borderless">
						<thead>
							<tr>
								<th class="gameTableCol1 warCells">Game Name</th>
								<th class="gameTableCol2 warCells">Map</th>
								<th class="gameTableCol3 warCells">Speed</th>
								<th class="gameTableCol4 warCells">Players</th>
							</tr>
						</thead>
						<tbody id="gameTableBody"></tbody>
					</table>
				</div>
			</div>
			
			<div id="titleChat" class="fw-primary text-center">';
			/* right flag window */
					echo '
					<div id="titleChatPlayers" class="titlePanelLeft">
						<div id="titleChatHeader" class="chat-warning nowrap">
							<span id="titleChatHeaderChannel"></span> 
							<span id="titleChatHeaderCount"></span>
						</div>
						<div id="titleChatBody"></div>
					</div>
					
					<div id="titleChatLog" class="titlePanelLeft">';
					/* right chat window */
					/* count from title screen */
					$result = mysqli_query($link, 'select count(row) count from `fwtitle` where timestamp > date_sub(now(), interval 20 second)');
					while ($row = mysqli_fetch_assoc($result)){
						$currentPlayers += $row['count'];
					}
					/* count playing game */
					$result = mysqli_query($link, 'select count(row) count from `fwplayers` where timestamp > date_sub(now(), interval 20 second)');
					// Associative array
					while ($row = mysqli_fetch_assoc($result)){
						$currentPlayers += $row['count'];
						echo '<div>There '. ($currentPlayers === 1 ? 'is' : 'are') .' '. $currentPlayers . ' '. ($currentPlayers === 1 ? 'person' : 'people') .' playing Firmament Wars</div><div class="chat-muted">Type /help for chat commands</div>';
					}
					echo 
					'</div>';
				?>
				<div id="titleChatWrap">
						
					<?php
						echo '
						<div class="input-group">
							<input id="title-chat-input" class="fw-text noselect nobg form-control" type="text" maxlength="240" autocomplete="off" spellcheck="false" />
							<div id="titleChatSend" class="input-group-btn">
								<button id="titleChatSendBtn" class="btn shadow4 fwBlue">Send</button>
							</div>
						</div>';
					?>
				</div>
			</div>
			
			<?php
			} else {
				echo '<div id="comingSoon">
					<a class="btn btn-responsive fwBlue shadow4" href="/createAccount.php?back=/games/firmament-wars">Create Account</a>
					 or <a class="btn btn-responsive fwBlue shadow4" href="/login.php?back=/games/firmament-wars">Login</a><br>with your Nevergrind account<br>to Play Firmament Wars!
					</div>';
			}
			?>
				
		</div>
	
		<div id="joinGameLobby" class="shadow4">
		
			<img id="worldTitle" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
		
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
					<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" id="lobbyFirmamentWarsLogo">
					<div id="lobbyRankedMatch" class="shadow4 ranked">Ranked Match</div> 
					<div id="lobbyGameNameWrap">
						<div class='text-primary margin-top'>Game Name:</div> 
						<div id='lobbyGameName'></div>
					</div>
					<div class='text-primary margin-top'>Game Mode:</div> 
					<div id='lobbyGameMode'></div>
					<div class='text-primary margin-top'>Map:</div>
					<div id='lobbyGameMap'></div>
					<div class='text-primary margin-top'>Speed:</div>
					<div id='lobbyGameSpeed'></div>
					<div class='text-primary margin-top'>Max Players:</div>
					<div id='lobbyGameMax'></div>
				</div>
				
				<div id="lobbyGovernmentDescription" class="fw-primary text-center lobbyRelWrap">
					<div id="lobbyGovName" class='text-primary'>Despotism</div>
					<div id="lobbyGovPerks">
						<div>3x starting production</div>
						<div>+50% starting troops</div>
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
			<div class='header text-center'>
				<h2 id="createGameHead" class="header">Create FFA Game</h2>
				<h2 id="createRankedGameHead" class='header ranked'>Create Ranked Game</h2>
			</div>
			<hr class="fancyhr">
			<div id="createGameFormWrap">
				
				<div id="createGameNameWrap">
					<div class='buffer2'>
						<label>Game Name</label>
					</div>
					<div class='buffer'>
						<input id='gameName' class='form-control createGameInput' type='text' maxlength='32' autocomplete='off'>
					</div>
				</div>
				
				<div id="createGamePasswordWrap">
					<div class='buffer2'>
						<label>Password (Private Game)</label>
					</div>
					
					<div class='buffer'>
						<input id='gamePassword' class='form-control createGameInput' type='text' maxlength='16' autocomplete='off'>
					</div>
				</div>
				
				<div id="createGameMaxPlayerWrap" class="pull-right">
					<div class='buffer2'>
						<label class='control-label'>Maximum Number of Players</label>
					</div>
					
					<div class='buffer'>
						<input id='gamePlayers' type='number' class='form-control createGameInput' id='gamePlayers' value='8' min='2' max='8'>
					</div>
				</div>
				
				<div id="createGameSpeedWrap">
					<div class='buffer2'>
						<label class='control-label'>Game Speed</label>
					</div>
					
					<div class='buffer w33'>
						<div class='dropdown'>
							<button id="speedDropdownBtn" class='btn btn-primary dropdown-toggle shadow4 fwDropdownButton' type='button' data-toggle='dropdown'>
								<span id='createGameSpeed'>Fastest</span>
								<i class="fa fa-caret-down text-warning lobbyCaret"></i>
							</button>
							<ul id='speedDropdown' class='dropdown-menu fwDropdown createGameInput' value="Normal">
								<li><a class='speedSelect' href='#'>Slower</a></li>
								<li><a class='speedSelect' href='#'>Slow</a></li>
								<li><a class='speedSelect' href='#'>Normal</a></li>
								<li><a class='speedSelect' href='#'>Fast</a></li>
								<li><a class='speedSelect' href='#'>Faster</a></li>
								<li><a class='speedSelect' href='#'>Fastest</a></li>
							</ul>
						</div>
					</div>
				</div>
				
				<div>
					<div class='buffer2'>
						<label class='control-label'>Map <?php 
						if (!$_SESSION['fwpaid']){
								echo '| <span class="unlockGameBtn text-warning">Unlock the complete game to select all maps</span>'; 
							}
						?>
						</label>
					</div>
					
					<div class='buffer w33'>
						<div class='dropdown'>
							<button class='btn btn-primary dropdown-toggle shadow4 fwDropdownButton' type='button' data-toggle='dropdown'>
								<span id='createGameMap'>Earth Omega</span>
								<i class="fa fa-caret-down text-warning lobbyCaret"></i>
							</button>
							<ul id='mapDropdown' class='dropdown-menu fwDropdown createGameInput'></ul>
						</div>
					</div>
					
					<div class='buffer2'>
						<label class='control-label'>Map Details</label>
					</div>
					<div class='buffer'>
						<span title='Max players on this map'>
							<i class='fa fa-users'></i>
							<span id='createGamePlayers'>8</span>
						</span>&ensp;
						<span title='Number of territories on this map'>
							<i class='fa fa-globe'></i> 
							<span id='createGameTiles'>78</span>
						</span>
					</div>
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
		
		<div id="joinPrivateGameModal" class="fw-primary container titleModal">
			<div class="row text-center">
				<div class='col-xs-12'>
					<h2 class='header'>Join Private Game</h2>
					<hr class="fancyhr">
				</div>
			</div>
			
			<div class="row buffer2 privateRow">
				<div class='col-xs-4 privateLabel'>
					<label class="control-label">Game Name</label>
				</div>
				<div class='col-xs-8'>
					<input type="text" class="joinGameInputs fwBlueInput" id="joinGame" maxlength="32" placeholder="Game Name">
				</div>
			</div>
			
			<div class="row buffer2 privateRow">
				<div class='col-xs-4 privateLabel'>
					<label class="control-label">Password</label>
				</div>
				<div class='col-xs-8'>
					<input type="text" class="joinGameInputs fwBlueInput" id="joinGamePassword" maxlength="16" placeholder="Password (Private Game)">
				</div>
			</div>
			
			<div class='row buffer text-center'>
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<button id="joinPrivateGameBtn" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Join Game</button>
					<button id='cancelCreateGame' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Cancel</button>
				</div>
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
					<?php
					if ($_SESSION['fwpaid']){
						echo '
						<div class="input-group">
							<input id="updateNationName" class="form-control" type="text" maxlength="32" autocomplete="off" size="24" aria-describedby="updateNationNameStatus" placeholder="Enter New Nation Name">
							<span class="input-group-btn">
								<button id="submitNationName" class="btn fwBlue shadow4" type="button">
									Update Nation Name
								</button>
							</span>
						</div>';
					} else {
						echo "<div class='text-center'><span class='unlockGameBtn text-warning'>Unlock the complete game to update your nation's name</span></div>";
					}
					?>
				</div>
			</div>
			
			<div class="row text-center">
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<h2 class='header'>Update Flag</h2>
					<hr class="fancyhr">
				</div>
			</div>
			
			<div class="row text-center">
				<div class="col-xs-6">
					<div class="dropdown">
						<button class="btn dropdown-toggle shadow4 fwDropdownButton" type="button" data-toggle="dropdown">
							<span id="selectedFlag"><?php echo $_SESSION['flagShort']; ?></span>
							<i class="fa fa-caret-down text-warning lobbyCaret"></i>
						</button>
						<ul id="flagDropdown" class="dropdown-menu fwDropdown"></ul>
					</div>
					<div id="flagPurchased" class="flagPurchasedStatus"></div>
				</div>
				<div class="col-xs-6">
					<img id="updateNationFlag" class="w100 block center" src="images/flags/<?php echo $flag; ?>">
				</div>
			</div>
			
			
			<div class="row text-center">
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<h2 class='header'>Update Avatar</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<div class="row">
				<?php
					if (!$_SESSION['fwpaid']){
						echo 
						'<div class="col-xs-12 text-warning text-center">
							<span class="unlockGameBtn">Unlock the complete game to update your dictator\'s avatar</span>
						</div>';
					} else {
						echo
						'<div class="col-xs-8">
							<form id="uploadDictator" action="php/uploadDictator.php" method="post" enctype="multipart/form-data">
								<p>Upload your dictator avatar. A 120x120 image is recommended. Image must be a jpg < 30 kb:</p>
								<p>
									<input id="dictatorAvatar" class="btn btn-primary fwBlue shadow4" type="file" accept=".jpg" name="image">
								</p>
								<p id="uploadErr" class="text-warning"></p>
								<p>
									<input class="btn btn-primary fwBlue shadow4" type="submit" value="Upload" name="submit">
								</p>
							</form>
						</div>
						<div class="col-xs-4">
							<img id="configureAvatarImage" class="dictator">
						</div>';
					}
				?>
			</div>
			
			<div class='row buffer text-center'>
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<button id="configureNationDone" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Done</button>
				</div>
			</div>
		</div>
		<?php
		if (!$_SESSION['fwpaid']){
			echo 
			'<div id="unlockGame" class="fw-primary container titleModal">
				<div class="row text-center">
					<div class="col-xs-12">
						<h2 class="header">Unlock Complete Game</h2>
						<hr class="fancyhr">
					</div>
				</div>
				<div class="row buffer">
					<div class="col-xs-12">
						<ul>
							<li>More Maps: Flat Earth, UK, USA, France, Italy, Japan, and Turkey!</li>
							<li>Rename your nation</li>
							<li>Display your dictator\'s avatar</li>
							<li>Display your military ribbons in game</li>
							<li>Select from 20 player colors</li>
						</ul>
					</div>
				</div>
				
				<div>
					<hr class="fancyhr">
					<p>
						<div>Card Number (no spaces or hyphens)</div>
						<input id="card-number" class="form-control" type="text" maxlength="16" autocomplete="off">
					</p>
					<p>
						<div>CVC (number on the back of your credit card)</div>
						<input id="card-cvc" class="form-control" type="text" maxlength="4" autocomplete="off">
					</p>
					<p>
						<div>Expiration Month/Year (MM/YY)</div>
						<input id="card-month" class="form-control" type="text" maxlength="2"> / 
						<input id="card-year" class="form-control" type="text" maxlength="2">
					</p>
				</div>
				<hr class="fancyhr">
				<div class="text-center">
					<p class="text-success">Unlock the complete game for $9.99</p>
					<p id="payment-errors" class="text-warning"></p>
					<div class="text-center">
						<button id="payment-confirm" class="btn fwGreen btn-lg shadow4 shadow4">Unlock Complete Game</button>
					</div>
				</div>
			</div>';
		};
		?>
		
		<div id="leaderboard" class="fw-primary container titleModal">
			<div class="row">
				<div class='col-xs-12 text-center'>
					<h2 class='header'>Leaderboard</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<div id="leaderboardBody" class="row">
				<div class="text-center">Loading...</div>
			</div>
			
			<div id="leaderboardFoot" class='row'>
				<div class='col-xs-12 text-center'>
					<hr class="fancyhr fancyhrNoTop">
					<button id="leaderboardDone" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Done</button>
				</div>
			</div>
		</div>
		
	</div>

	<div id="gameWrap">
		<div id="targetWrap" class="blueBg gameWindow">
			<table id="target-ui">
				<tr>
					<td id="avatarWrap" class="tight">
						<div id="ribbonWrap" class="tight wideRack"></div>
						<img id="avatar" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
					</td>
					<td id="targetName" class="text-center shadow4 tight">
						<div class="targetNameAnchor">
							<img id="targetFlag" class="targetFlag" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
							<div id="targetNameSpan" class="nowrap">
								<span id="targetCapStar" class="no-select shadow4" title="Capital Palace Boosts tile defense">
									<i class="glyphicon glyphicon-star capitalStar"></i>
								</span>
								<span id="targetNameWrap"></span>
							</div>
							<svg id="targetBarsWrap" class="targetBarsWrap"></svg>
						</div>
						
						<div id="targetTargetWrap" class="targetNameAnchor">
							<img id="targetTargetFlag" class="targetFlag" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
							<div id="targetTargetNameSpan" class="nowrap">
								<span id="targetTargetCapStar" class="no-select shadow4" title="Capital Palace Boosts tile defense">
									<i class="glyphicon glyphicon-star capitalStar"></i>
								</span>
								<span id="targetTargetNameWrap"></span>
							</div>
							<svg id="targetTargetBarsWrap" class="targetBarsWrap"></svg>
						</div>
					</td>
				</tr>
			</table>
		</div>
		
		<div id="ui2" class="blueBg gameWindow">
			<div class="flagWrapper">
				<img id="ui2-flag" class="ui2-flag">
			</div>
			<div id="ui2-head" class="stagBlue">
				<span id='manpowerWrap' class="manpower pull-left">
					<span  
						data-placement="bottom"
						title="Great Generals boost troop attack">
						<i class="glyphicon glyphicon-star"></i>
						<span id="oBonus">0</span> 
					</span>&nbsp;
					<span   
						data-placement="bottom"
						title="Great Tacticians boost troop defense" class="marginLeft">
						<i class="glyphicon glyphicon-star-empty"></i>
						<span id="dBonus">0</span>
					</span>
				</span>
				<span class="marginLeft">
					<span
						data-placement="bottom"
						title="Deploy troops to conquered territories">
						<i class="fa fa-angle-double-up manpower"></i> Troops <span id="manpower">0</span>
					</span>
				</span>
			</div>
						
			<div id="tileActions" class="container w100">
				<div class="actionHead shadow4">Command</div>
				
				<div id="attack" class="actionButtons row" 
					data-placement="bottom"
					title="Move/attack with all troops">
					<div class="col-xs-8">
						<span class='text-hotkey'>A</span>ttack
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-bolt moves pointer actionBolt">
						</i><span id='attackCost'>2</span>
					</div>
				</div>
				
				<div id="splitAttack" class="actionButtons row" 
					title="Move/attack with half of your troops">
					<div class="col-xs-8">
						<span class='text-hotkey'>S</span>plit Attack
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-bolt moves pointer actionBolt">
						</i><span id="splitAttackCost">1</span>
					</div>
				</div>
				
				<div id="rush" class="actionButtons row" 
					title="Deploy 3 troops using energy instead of production. Boosted by culture.">
					<div class="col-xs-8">
						<span class='text-hotkey'>R</span>ush Troops
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-bolt moves pointer actionBolt">
						</i><span id="rushCost">4</span>
					</div>
				</div>
				
				<div class="actionHead shadow4">Build</div>
				
				<div id="deploy" class="actionButtons row" 
					title="Deploy troops to a tile">
					<div class="col-xs-8">
						<span class='text-hotkey'>D</span>eploy Troops
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='deployCost'>20</cost>
					</div>
				</div>
				
				<div id="fireCannons" class="actionButtons row"
					title="Fire cannons at an adjacent enemy tile. Kills 2 + 4% of troops.">
					<div class="col-xs-8">
						Fire <span class='text-hotkey'>C</span>annons
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='cannonsCost'>40</span>
					</div>
				</div>
			
				<div id="upgradeTileDefense" class="actionButtons row" 
					 
					title="Bunkers upgrade the structural defense of a territory">
					<div class="col-xs-8">
						<span class='text-hotkey'>B</span>uild <span id="buildWord">Bunker</span>
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id="buildCost">80</span>
					</div>
				</div>
				
				<div id="launchMissile" class="actionButtons row"
					title="Launch a missile at any enemy territory. Kills 5 + 15% of troops.">
					<div class="col-xs-8">
						Launch <span class='text-hotkey'>M</span>issile
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='missileCost'>60</span>
					</div>
				</div>
				
				<div id="launchNuke" class="actionButtons row" 
					title="Launch a nuclear weapon at any enemy territory. Kills 80-99% of troops and destroys all structures.">
					<div class="col-xs-8">Launch <span class='text-hotkey'>N</span>uke</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='nukeCost'>400</span>
					</div>
				</div>
				
				<div id="tileActionsOverlay"></div>
			
			</div>
			
			<div id="tileResearch" class="container w100">
				<div class="actionHead shadow4">Research</div>
				
				<div id="researchGunpowder" class="actionButtons row" 
					 
					title="Research gunpowder to unlock cannons.">
					<div class="col-xs-8">
						<span class='text-hotkey'>G</span>unpowder
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='gunpowderCost'>80</span>
					</div>
				</div>
				
				<div id="researchEngineering" class="actionButtons row" 
					 
					title="Research engineering to unlock walls and fortresses.">
					<div class="col-xs-8">
						<span class='text-hotkey'>E</span>ngineering
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='engineeringCost'>120</span>
					</div>
				</div>
				
				<div id="researchRocketry" class="actionButtons row" 
					 
					title="Research rocketry to unlock missiles.">
					<div class="col-xs-8">
						Roc<span class='text-hotkey'>k</span>etry
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='rocketryCost'>200</span>
					</div>
				</div>
				
				<div id="researchAtomicTheory" class="actionButtons row" 
					 
					title="Research atomic theory to unlock nuclear weapons.">
					<div class="col-xs-8">
						A<span class='text-hotkey'>t</span>omic Theory
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='atomicTheoryCost'>250</span>
					</div>
				</div>
				
				<div id="researchFutureTech" class="actionButtons row" 
					 
					title="Research future technology.">
					<div class="col-xs-8">
						<span class='text-hotkey'>F</span>uture Tech
					</div>
					<div class="col-xs-4 tight2 text-right productionCost">
						<i class="fa fa-gavel production pointer actionBolt"></i>
						<span id='futureTechCost'>1000</span>
					</div>
				</div>
			</div>
			
		</div>
		
			
		<div id="resources-ui" class="container shadow4 blueBg gameWindow">
			<div id="resourceHead">
				<i id="hotkeys" class="pointer options fa fa-keyboard-o" title="Hotkeys"></i>
				<i id="options" class="pointer options fa fa-volume-up" title="Audio"></i>
				<i id="surrender" class="pointer fa fa-flag" title="Surrender"></i>
				<i id="exitSpectate" class="pointer fa-times-circle">Exit Game</i>
			</div>
			
			<div class="row">
				<div id="currentYear" class="col-xs-12 no-padding chat-rating">
					4000 B.C.
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding moves">
					<span title="Energy is used to move and rush troops.">
						Energy <i class="fa fa-bolt"></i>
					</span>
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div class="barWrap resourceBar resourceBarParent">
						<div id="energyBar" class="resourceBar"></div>
						<div id="energyIndicator"></div>
						<div class="resourceIndicator resourceRight abs">
							<span id="moves">2</span> 
							+<span id="sumMoves">4</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding production">
					<span  title="Productions Bonus">
						+<span id="productionBonus">0</span>%
					</span>
					<span  title="Production is used to deploy troops, build structures, and research technology.">
						Production <i class="fa fa-gavel"></i>
					</span>
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div class="resourceIndicator">
						<span id="production">0</span> 
						<span  title="Production per turn">
							+<span id="sumProduction">0</span>
						</span>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding food">
					<span  title="Food Bonus">
						+<span id="foodBonus">0</span>%
					</span>
					<span  title="Food milestones produce additional troops">
						Food <i class="glyphicon glyphicon-apple"></i> 
					</span>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div id="foodBarWrap" class="barWrap resourceBar resourceBarParent">
						<div id="foodBar" class="resourceBar"></div>
						<div class="resourceIndicator resourceCenter abs">
							<span id="food">0</span>/<span id="foodMax">25</span> 
							+<span id="sumFood">0</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding culture">
					<span  title="Culture Bonus">
						+<span id="cultureBonus">0</span>%
					</span>
					<span  title="Culture milestones produce special rewards">
						Culture <i class="fa fa-flag"></i>
					</span>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12 no-padding">
					<div id="cultureBarWrap" class="barWrap resourceBar resourceBarParent">
						<div id="cultureBar" class="resourceBar"></div>
						<div class="resourceIndicator resourceCenter abs">
							<span id="culture">0</span>/<span id="cultureMax">300</span> 
							+<span id="sumCulture">0</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		
		<div id="hotkey-ui" class="shadow4">Press V to toggle the UI</div>
		<div id="diplomacy-ui" class="shadow4 blueBg gameWindow"></div>
		
		<table id="chat-ui" class="fw-text no-select no-point">
			<tr>
				<td id="chat-content"></td>
			</tr>
		</table>
		
		<input id="chat-input" class="fw-text nobg" type='text' maxlength="240" autocomplete="off" spellcheck="false"/>
			
		<div id="worldWrap"></div>
		
		<div id="hud" class="shadow4">Select Target</div>
		
		<div id="surrenderScreen" class="fw-primary fw-text">
			<p>Surrender? Are You Sure?</p>
			<div id="cancelSurrenderButton" class="endBtn">
				<div class="modalBtnChild">Cancel</div>
			</div>
			<div id="surrenderButton" class="endBtn">
				<div class="modalBtnChild">Surrender</div>
			</div>
		</div>
		
		<div id="victoryScreen" class="fw-primary fw-text"></div>
		
		<div id="statWrap" class="fw-text"></div>
		
	</div>

	<audio id="bgmusic" autoplay loop preload="auto"></audio>
	
	<div id="hotkeysModal" class='fw-primary titleModal'>
		<h2 class='header text-center'>Hotkeys</h2>
		<hr class="fancyhr">
		
		<div id="hotkeysFormWrap" class="container w100">
			<div class='row buffer2'>
				<div class='col-xs-4'>
					TAB
				</div>
				<div class='col-xs-8'>
					Next Target
				</div>
			</div>
			
			<div class='row'>
				<div class='col-xs-4'>
					SHIFT+TAB
				</div>
				<div class='col-xs-8'>
					Previous Target
				</div>
			</div>
			
			<div class='row'>
				<div class='col-xs-4'>
					ENTER
				</div>
				<div class='col-xs-8'>
					Open Chat
				</div>
			</div>
			
			<div class='row'>
				<div class='col-xs-4'>
					ESC
				</div>
				<div class='col-xs-8'>
					Clear Chat/Target
				</div>
			</div>
			
			<div class='row'>
				<div class='col-xs-4'>
					V
				</div>
				<div class='col-xs-8'>
					Toggle UI
				</div>
			</div>
			
			<div class='row'>
				<div class='col-xs-4'>
					CTRL+R
				</div>
				<div class='col-xs-8'>
					Reply to last private message
				</div>
			</div>
		</div>
		
		<hr class='fancyhr buffer2'>
		<div class='text-center'>
			<button id='hotkeysDone' type='button' class='btn btn-md fwGreen btn-responsive shadow4'>Done</button>
		</div>
	</div>
	
	<div id="optionsModal" class='fw-primary titleModal'>
		<h2 class='header text-center'>Audio</h2>
		<hr class="fancyhr">
		<div id="optionsFormWrap" class="container w100">
		
			<div class='row buffer2'>
				<div class='col-xs-4'>
					Music Volume
				</div>
				<div class='col-xs-8 text-right'>
					<?php
						if ($_SESSION['fwpaid']){
							echo '<input id="musicSlider" class="sliders" type="text"/>';
						} else {
							echo '<span class="text-warning">Unlock the complete game to enable the music</span>';
						}
					?>
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
	
	<div id="screenFlash"></div>
	<div id="overlay" class="portal"></div>
	<div id="Msg" class="shadow4"></div>
</body>

<script src="js/libs/TweenMax.min.js"></script>
<script src="js/libs/jquery.min.js"></script>
<script src="js/libs/Draggable.min.js"></script>
<script src="js/libs/DrawSVGPlugin.min.js"></script>
<script src="js/libs/SplitText.min.js"></script>
<script src="js/libs/autobahn.min.js"></script>
<?php
	if (!$_SESSION['fwpaid']){
		echo '<script src="https://js.stripe.com/v2/"></script>
			<script>
				location.host === "localhost" ? 
					Stripe.setPublishableKey("pk_test_GtNfTRB1vYUiMv1GY2kSSRRh") :
					Stripe.setPublishableKey("pk_live_rPSfoOYjUrmJyQYLnYJw71Zm");
			</script>';
	}
?>
<script src="js/libs/bootstrap.min.js"></script>
<script src="js/libs/bootstrap-slider.min.js"></script>
<?php
	require $_SERVER['DOCUMENT_ROOT'] . '/includes/ga.php';
	echo '<script>
		var fwpaid = '. $_SESSION['fwpaid'] .';
		var nationRow = '. $_SESSION['nationRow'] .';
		// set channel
		if (location.hash.length > 1){
			initChannel = location.hash.slice(1);
		} else {
			initChannel = "usa-" + (~~(Math.random()*'. ($currentPlayers / 1000) .') + 1);
		}'; ?>
	(function(d){
		if (location.host === 'nevergrind.com' || location.hash === '#test'){
			var scripts = [
				'firmament-wars'
			]
		} else {
			var scripts = [
				'payment',
				'stats',
				'animate',
				'core',
				'title',
				'lobby',
				'ws',
				'audio',
				'map',
				'ui',
				'actions',
				'events'
			]
		}
		for(var i=0, len=scripts.length; i<len; i++){
			var x = d.createElement('script');
			x.src = 'js/' + scripts[i]+'.js?v=' + version;
			x.async = false;
			d.head.appendChild(x);
		}
	})(document);
</script>
</html>