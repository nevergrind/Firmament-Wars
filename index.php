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
	
	if (!isset($_SESSION['guest'])){
		// first visit
		if ( !isset($_SESSION['email']) && !isset($_SESSION['account']) ){
			// guests
			mysqli_query($link, "insert into fwguests (`row`) VALUES (null)");
			$guestId = mysqli_insert_id($link);
			$_SESSION['guest'] = 1;
			$_SESSION['account'] = 'guest_'. $guestId;
		} else {
			// logged in - not a guest
			$_SESSION['guest'] = 0;
		}
	} else { 
		// guest already determined
		if (strpos($_SESSION['account'], '_') !== FALSE){
			$_SESSION['guest'] = 1;
		} else {
			$_SESSION['guest'] = 0;
		}
	}
?>
<!DOCTYPE html> 
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head id='head'>
	<title>Firmament Wars | Free Multiplayer Risk-Like Grand Strategy War Game</title>
	<meta charset="utf-8">
	<meta name="keywords" content="free, risk, browser, multiplayer, online, strategy, html5">
	<meta name="description" content="A free multiplayer strategy game playable in your web browser! Gameplay is like Risk meets Civilization Revolution! Offers team, FFA, and ranked modes!">
	<meta name="author" content="Joe Leonard">
	<meta name="referrer" content="always">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
	<meta property="article:published_time" content="<?php echo date("F d Y H:i:s",filemtime("index.php")); ?>">
	
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/bootstrap-slider.min.css">
	<link rel="stylesheet" href="css/font-awesome.min.css">
	<link rel="stylesheet" href="css/firmament-wars.css?v=1-1-21">
	<script>
		version = '1-1-21';
	</script>
	<link rel="shortcut icon" href="/images1/favicon.png">
</head>

<body id="body">
		
	<div id="titleViewBackdrop"></div>

	<div id="firmamentWarsLogoWrap">
		<img src="images/title/firmament-wars-background-2-75.jpg" id="firmamentWarsBG" title="Firmament Wars Background">
	</div>
	
	<div id="mainWrap">
	
		<div id="titleMain" class="container-fluid">
			
			<header class="shadow4 text-primary row">
				<div class="col-xs-12">
				<?php
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
				$_SESSION['avatar'] = $_SESSION['defaultAvatar'];
				$nation = 'Kingdom of '. ucfirst($_SESSION['account']);
				$flag = !isset($_SESSION['flag']) ? 'United States.jpg' : $_SESSION['flag'];
				
				if($count > 0){
					// nation exists
					$query = "select nation, flag, rating, wins, losses, teamWins, teamLosses, rankedWins, rankedLosses, disconnects, avatar from fwnations where account=?";
					$stmt = $link->prepare($query);
					$stmt->bind_param('s', $_SESSION['account']);
					$stmt->execute();
					$stmt->bind_result($dName, $dFlag, $rating, $wins, $losses, $teamWins, $teamLosses, $rankedWins, $rankedLosses, $disconnects, $avatar);
					while($stmt->fetch()){
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
						$_SESSION['avatar'] = $avatar;
					}
					// init nation values
					$_SESSION['rating'] = $rating;
					$_SESSION['nation'] = $nation;
					$_SESSION['flag'] = $flag;
				} else {
					if (!$_SESSION['guest']){
						// create nation
						$query = "insert into fwnations (`account`, `nation`, `flag`, `avatar`) VALUES (?, '$nation', '$flag', '". $_SESSION['defaultAvatar'] ."')";
						$stmt = $link->prepare($query);
						$stmt->bind_param('s', $_SESSION['account']);
						$stmt->execute();
					}
					$_SESSION['nation'] = $nation;
					$_SESSION['flag'] = $flag;
				}
				$arr = explode(".", $_SESSION['flag']);
				$_SESSION['flagShort'] = $arr[0];
				$_SESSION['flagClass'] = str_replace(" ", "-", $arr[0]);
				
				if (isset($_SESSION['email'])){
					echo 
					'<a href="/account" target="_blank" class="btn fwBlue btn-responsive shadow4" title="Manage Account">'. $_SESSION['account'] .'</a>&ensp;';
				}
				?>
					<a href="/blog/how-to-play-firmament-wars/" target="_blank" title="Nevergrind Browser Game Development News and Articles">How to Play</a>&ensp;
					<i id="options" class="pointer options fa fa-volume-up"></i>
				<div class="pull-right text-primary">
					<a href="//twitch.tv/maelfyn" target="_blank">
						<i class="fa fa-twitch text-primary pointer"></i>
					</a>
					<a href="//youtube.com/c/Maelfyn" target="_blank">
						<i class="fa fa-youtube text-primary pointer"></i>
					</a>
					<a href="//www.facebook.com/neverworksgames" target="_blank">
						<i class="fa fa-facebook text-primary pointer"></i>
					</a>
					<a href="//twitter.com/maelfyn" target="_blank">
						<i class="fa fa-twitter text-primary pointer"></i>
					</a>
				<?php
				if (isset($_SESSION['email'])){
					echo '&ensp;<a id="logout" class="btn fwBlue btn-responsive shadow4">Logout</a>';
				} else {
					echo '&ensp;<a id="login" class="btn btn-responsive fwBlue shadow4" href="/login.php?back=/games/firmament-wars">Login</a>';
				}
				?>
					</div>
				</div>
				
			</header>
			
			<div id="titleMenu" class="fw-primary col-xs-5">
				
				<div id="menuHead">
					<button id="toggleNation" type="button" class="btn fwBlue btn-responsive shadow4">
						Configure Nation
					</button>
					<button id="leaderboardBtn" type="button" class="btn fwBlue btn-responsive shadow4">
						Leaderboard
					</button>
				</div>
				<hr class="fancyhr">
				
				<h1>
					<div>Firmament Wars | Multiplayer Risk-like Strategy</div>
					<div>
						a free online game by <a href="https://www.linkedin.com/company/neverworks-games-llc">Neverworks Games</a>
					</div>
				</h1>
				<img id="firmamentWarsLogo" src="images/title/firmament-wars-logo-1280.png">
			
				<!--div id="myNationWrap" class="container tight w100">
				
					<img class="nationFlag" id="nationFlag" src="images/flags/<?php echo $flag; ?>" title="<?php echo $_SESSION['flagShort']; ?>">
					<div class='row fw-text'>
						<div class='col-xs-3'>
							Name:
						</div>
						<div class='col-xs-9' id="nationName">
							<div id="configureNationName" class="configureNationName">
								<?php echo $_SESSION['nation']; ?>
							</div>
						</div>
						<div class='col-xs-3'>
							FFA:
						</div>
						<div class='col-xs-9'>
							<?php echo $_SESSION['wins'] .'-'. $_SESSION['losses']; ?>
						</div>
						<div class='col-xs-3'>
							Team:
						</div>
						<div class='col-xs-9'>
							<?php echo $_SESSION['teamWins'] .'-'. $_SESSION['teamLosses']; ?>
						</div>
						<div class='col-xs-3'>
							Ranked:
						</div>
						<div class='col-xs-9'>
							<?php echo $_SESSION['rankedWins'] .'-'. $_SESSION['rankedLosses']; ?>
						</div>
						<div class='col-xs-3'>
							Rating:
						</div>
						<div class='col-xs-9'>
							<?php echo $_SESSION['rating']; ?>
						</div>
					</div>
				
				</div-->
				<div class="fw-text">
					<hr class="fancyhr">
					
					<div>
						<button id="refresh-game-button" type="button" class="btn btn-md fwBlue btn-responsive shadow4 pull-right" title="Refresh Game List">
							<i class="fa fa-refresh pointer"></i>
						</button>
						<button id="play-now-btn" type="button" class="btn btn-md fwBlue btn-responsive shadow4">
							Play Now
						</button>
						<div class="btn-group" class="fwBlue">
							<button id="createGameBtn" type="button" class="titleButtons btn btn-md btn-responsive shadow4 dropdown-toggle fwDropdownButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Create Game <span class="titleCaret caret chat-warning"></span>
							</button>
							<ul class="dropdown-menu fwDropdown">
								<li id="create" class="gameSelect">
									<a href="#">Free For All</a>
								</li>
								<li id="createTeamBtn" class="gameSelect">
									<a href="#">Team Game</a>
								</li>
								<?php
								if (!$_SESSION['guest'] && isset($_SESSION['email'])){
									echo '<li id="createRankedBtn" class="gameSelect">
										<a href="#">Ranked Match</a>
									</li>';
								}
								?>
							</ul>
						</div>
						<button id="joinPrivateGameBtn" type="button" class="btn btn-md fwBlue btn-responsive shadow4">Join Private Game</button>
					</div>
					
					<hr class="fancyhr">
				</div>

				<div id="refreshGameWrap" class="buffer2">
					<table id="gameTable" class="table table-condensed table-borderless">
						<thead>
							<tr id="gameTableHead">
								<th class="gameTableCol1 warCells">Game Name</th>
								<th class="gameTableCol2 warCells">Map</th>
								<th class="gameTableCol3 warCells">Turn Duration</th>
								<th class="gameTableCol4 warCells">Game Type</th>
							</tr>
						</thead>
						<tbody id="gameTableBody"></tbody>
					</table>
				</div>
				
				<hr class="fancyhr">
				<div class="nowrap"  style="margin: 6px 0">
					<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
					<!-- firmament wars ads -->
					<ins class="adsbygoogle center"
						 style="display:block;"
						 data-ad-client="ca-pub-8697751823759563"
						 data-ad-slot="3352931782"
						 data-ad-format="auto"></ins>
					<script>
					(adsbygoogle = window.adsbygoogle || []).push({});
					</script>
				</div>
			</div>
			
			<div id="titleChat" class="fw-primary text-center col-xs-7">
				<div class="nowrap"  style="margin: 6px 0">
					<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
					<!-- firmament wars ads -->
					<ins class="adsbygoogle center"
						 style="display:block"
						 data-ad-client="ca-pub-8697751823759563"
						 data-ad-slot="3352931782"
						 data-ad-format="auto"></ins>
					<script>
					(adsbygoogle = window.adsbygoogle || []).push({});
					</script>
				</div>
				<div id="titleChatPlayers" class="titlePanelLeft row">
					<div class="col-xs-5 tight">
						<div id="titleChatHeader" class="chat-warning nowrap">
							<span id="titleChatHeaderChannel"></span> 
							<span id="titleChatHeaderCount"></span>
						</div>
						<div id="title-chat-btn-wrap" class="text-center">
							<div id="title-chat-btns" class="btn-group" role="group">
								<button id="friend-status" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Friend list">
									<i class="fa fa-users pointer"></i>
								</button>
								<button id="add-friend" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Toggle friend">
									<i class="fa fa-user-plus pointer"></i>
								</button>
								<button id="who-account" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Query account data">
									<i class="fa fa-vcard pointer"></i>
								</button>
								<button id="whisper-account" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Send another account a private message">@</button>
								<button id="change-channel" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Change Channel">#</button>
								<button id="share-url" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Share hyperlink with channel">
									<i class="fa fa-external-link pointer"></i>
								</button>
								<button id="share-image" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Share image with channel using URL from another website">
									<i class="fa fa-file-image-o pointer"></i>
								</button>
								<button id="share-video" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Share video with channel using a youtube video URL">
									<i class="fa fa-file-video-o pointer"></i>
								</button>
								<button id="ignore-user" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Ignore account messages">
									<i class="fa fa-microphone-slash pointer"></i>
								</button>
								<button id="get-help" class="btn-group btn btn-xs btn-responsive fwBlue shadow4" title="Help">
									<i class="fa fa-question pointer"></i>
								</button>
							</div>
						</div>
						<div id="titleChatBody"></div>
					</div>
					
					<div class="col-xs-7 tight">
						<div id="titleChatLog" class="titlePanelLeft">
							<div class="chat-warning">Game night every Thursday @ 9 p.m. EST, 1 a.m. GMT.</div>
							<a href="//discord.gg/D4suK8b" target="_blank">Join our Discord Server to receive notifications!</a>
							<!-- 
								right chat window
								count from title screen 
							-->
							<?php
							$currentPlayers = 0;
							$result = mysqli_query($link, 'select count(row) count from `fwtitle` where timestamp > date_sub(now(), interval 20 second)');
							if ($result->num_rows){
								while ($row = mysqli_fetch_assoc($result)){
									$currentPlayers += $row['count'];
								}
							}
							/* count playing game */
							$result = mysqli_query($link, 'select count(row) count from `fwplayers` where cpu=0 and timestamp > date_sub(now(), interval 20 second)');
							// Associative array
							if ($result->num_rows){
								while ($row = mysqli_fetch_assoc($result)){
									$currentPlayers += $row['count'];
									echo '<div>There '. ($currentPlayers === 1 ? 'is' : 'are') .' '. $currentPlayers . ' '. ($currentPlayers === 1 ? 'person' : 'people') .' playing Firmament Wars</div>';
								}
							}
							?>
						</div>
					</div>
				</div>
					
				
				<div id="titleChatWrap">
					<div class="input-group">
						<input id="title-chat-input" class="fw-text noselect nobg form-control" type="text" maxlength="240" autocomplete="off" spellcheck="false" />
						<div id="titleChatSend" class="input-group-btn">
							<button id="titleChatSendBtn" class="btn shadow4 fwBlue">Send</button>
						</div>
					</div>
				</div>
			</div>
				
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
					<div id="lobbyGamePasswordWrap" class="none">
						<div class='text-primary margin-top'>Password:</div> 
						<div id='lobbyGamePassword'></div>
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
					<div id="lobbyGovPerks"></div>
				</div>
				
				<div id="lobbyButtonWrap" class="fw-primary text-center lobbyRelWrap">
					<button id='startGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons none'>Start Game</button>
					<button id='cancelGame' type='button' class='btn btn-default btn-md btn-block btn-responsive shadow4 lobbyButtons'>Exit</button>
					<div id='countdown' class='text-warning'></div>
				</div>
			</div>
			
		</div>
		
		<div id='createGameWrap' class='fw-primary title-modals'>
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
						<label class='control-label'>Turn Duration</label>
					</div>
					
					<div class='buffer w33'>
						<div class='dropdown'>
							<button id="speedDropdownBtn" class='btn btn-primary dropdown-toggle shadow4 fwDropdownButton' type='button' data-toggle='dropdown'>
								<span id='createGameSpeed'>15</span>
								<i class="fa fa-caret-down text-warning lobbyCaret"></i>
							</button>
							<ul id='speedDropdown' class='dropdown-menu fwDropdown createGameInput' value="15">
								<li><a class='speedSelect' href='#'>15</a></li>
								<li><a class='speedSelect' href='#'>20</a></li>
								<li><a class='speedSelect' href='#'>25</a></li>
								<li><a class='speedSelect' href='#'>30</a></li>
							</ul>
						</div>
					</div>
				</div>
				
				<div>
					<div class='buffer2'>
						<label class='control-label'>Map</label>
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
		
		<div id="joinPrivateGameModal" class="fw-primary container title-modals">
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
		
		<div id="configureNation" class="fw-primary container title-modals">
			<div class="row text-center">
				<div class='col-xs-12'>
					<h2 class='header'>Update Name</h2>
					<hr class="fancyhr">
				</div>
			</div>
			<div class="row">
				<div class="col-xs-12">
					<?php
					if ($_SESSION['guest']){
						?> 
						<div class='text-center text-warning'>Sign up to update your nation's name</div>
						<?php
					} else {
						?> 
						<div class="input-group">
							<input id="updateNationName" class="form-control" type="text" maxlength="32" autocomplete="off" size="24" aria-describedby="updateNationNameStatus" placeholder="Enter New Nation Name">
							<span class="input-group-btn">
								<button id="submitNationName" class="btn fwBlue shadow4" type="button">
									Update Nation Name
								</button>
							</span>
						</div>
						<?php
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
				<?php if (!$_SESSION['guest']){ ?>
				<div class="col-xs-8">
					<p>Upload your dictator avatar. A 200x200 image is recommended. Image must be a jpg < 40 kb:</p>
					<p>
						<input id="dictatorAvatar" class="btn btn-primary fwBlue shadow4" type="file" accept=".jpg" name="image">
					</p>
					<p id="uploadErr" class="text-warning"></p>
				</div>
				<div class="col-xs-4">
					<img id="configureAvatarImage" class="dictator">
				</div>
				<?php } else { ?>
					<div class="col-xs-12 text-warning text-center">
						Sign up to update your nation's name
					</div>
				<?php } ?>
			</div>
			
			<div class='row text-center'>
				<div class='col-xs-12'>
					<hr class="fancyhr">
					<button id="configureNationDone" type="button" class="btn btn-md fwGreen btn-responsive shadow4">Done</button>
				</div>
			</div>
		</div>
		
		<div id="leaderboard" class="fw-primary container title-modals">
			<div class="row">
				<div class="col-xs-12">
					<button id="leaderboardDone" type="button" class="btn btn-md fwGreen btn-responsive shadow4 pull-right">Done</button>
					<button id="leaderboardFFABtn" type="button" class="btn fwBlue btn-responsive shadow4">FFA</button>
					<button id="leaderboardTeamBtn" type="button" class="btn fwBlue btn-responsive shadow4">Team</button>
					<button id="leaderboardRankedBtn" type="button" class="btn fwBlue btn-responsive shadow4 ranked">Ranked</button>
					<button id="leaderboard-trips-btn" type="button" class="btn fwBlue btn-responsive shadow4">Trips</button>
					<button id="leaderboard-quads-btn" type="button" class="btn fwBlue btn-responsive shadow4">Quads</button>
					<button id="leaderboard-pents-btn" type="button" class="btn fwBlue btn-responsive shadow4">Pents</button>
					<hr class="fancyhr">
				</div>
				
				<div id="leaderboardBody" class="col-xs-12">
					<div class="text-center">Loading...</div>
				</div>
			</div>
		</div>
		
	</div>

	<div id="gameWrap">
		<div id="targetWrap" class="blueBg gameWindow">
			<table id="target-ui">
				<tr>
					<td id="avatarWrap" class="tight">
						<img id="avatar" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
					</td>
					<td id="targetName" class="text-center shadow4 tight">
						<div id="targetNameAnchor">
							<img id="targetFlag" class="targetFlag" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
							<div>
								<i id="targetCapStar" class="glyphicon glyphicon-star capitalStar no-select shadow4 none"></i>
								<span id="targetNameWrap"></span>
							</div>
							<div id="targetResources"></div>
						</div>
					</td>
				</tr>
			</table>
		</div>
		
		<div id="resources-ui" class="shadow4 blueBg gameWindow">
			<div id="resourceHead">
				<i id="resync" class="pointer options fa fa-refresh" title="Attempt to resynchronize game data. Try this if your game seems to be in a bugged state"></i>
				<i id="hotkeys" class="pointer options fa fa-keyboard-o" title="Hotkeys"></i>
				<i id="options" class="pointer options fa fa-volume-up" title="Audio"></i>
				<i id="surrender" class="pointer fa fa-flag" title="Surrender"></i>
				<i id="exitSpectate" class="pointer fa fa-times-circle none"></i>
			</div>
			<div id="resourceBody">
			
				<div id="currentYearWrap" class="chat-rating">
					<div id="currentYearBG"></div>
					<span id="currentYear">4000 B.C.</span>
				</div>
			
				<div class="no-padding moves">
					<button id="endTurn" class="btn btn-xs btn-responsive fwBlue">End Turn</button>
					<span title="Energy is used to move and rush troops.">
						Energy <i class="fa fa-bolt"></i>
					</span>
				</div>
				
				<div class="no-padding" title="Turn ends when time expires or when all players have spent their energy">
					<div class="barWrap resourceBar resourceBarParent">
						<div id="energyBar" class="resourceBar"></div>
						<div id="energyIndicator"></div>
						<div class="resourceIndicator resourceRight abs">
							<span id="moves">4</span> 
							+<span id="sumMoves">4</span>
						</div>
					</div>
				</div>
			
				<div class="no-padding production">
					<span  title="Productions Bonus">
						+<span id="productionBonus">0</span>%
					</span>
					<span  title="Production is used to deploy troops, build structures, and research technology.">
						Production <i class="fa fa-gavel"></i>
					</span>
				</div>
				
				<div class="no-padding">
					<div class="resourceIndicator">
						<span id="production">0</span> 
						<span  title="Production per turn">
							+<span id="sumProduction">0</span>
						</span>
					</div>
				</div>
				
				<div class="no-padding food">
					<span  title="Food Bonus">
						+<span id="foodBonus">0</span>%
					</span>
					<span  title="Food milestones produce additional troops">
						Food <i class="fa fa-apple"></i> 
					</span>
				</div>
				
				<div class="no-padding">
					<div id="foodBarWrap" class="barWrap resourceBar resourceBarParent">
						<div id="foodBar" class="resourceBar"></div>
						<div class="resourceIndicator resourceCenter abs">
							<span id="food">0</span>/<span id="foodMax">25</span> 
							+<span id="sumFood">0</span>
						</div>
					</div>
				</div>
				
				<div class="no-padding culture">
					<span  title="Culture Bonus">
						+<span id="cultureBonus">0</span>%
					</span>
					<span  title="Culture milestones produce special rewards">
						Culture <i class="fa fa-flag"></i>
					</span>
				</div>
				
				<div class="no-padding">
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
		
		<div id="ui2" class="blueBg gameWindow">
			<div id="ui2-head" class="stagBlue">
				<span id='manpowerWrap' class="manpower pull-left">
					<span  
						data-placement="bottom"
						title="Great Generals boost troop attack">
						<i class="glyphicon glyphicon-star"></i>
						<span id="oBonus">0</span> 
					</span>&thinsp;
					<span   
						data-placement="bottom"
						title="Great Tacticians boost troop defense">
						<i class="fa fa-shield"></i>
						<span id="dBonus">0</span>
					</span>
				</span>
				<span class="marginLeft">
					<span data-placement="bottom"
						title="Deploy troops to conquered territories">
						Troops <span id="manpower">0</span>
					</span>
				</span>
			</div>
						
			<div id="tileActions" class="container w100">
				<div class="row actionHead shadow4">
					<i class="fa fa-bolt moves resourceIcon"></i>Command
				</div>
				
				<div id="attack" class="actionButtons row" 
					title="Attack with all troops">
					<div class="col-xs-9">
						<span class='text-hotkey'>A</span>ttack
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='attackCost'>2</span>
					</div>
				</div>
				
				<div id="splitAttack" class="actionButtons row" 
					title="Attack with half of your troops">
					<div class="col-xs-9">
						<span class='text-hotkey'>S</span>plit Attack
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						</i><span id="splitAttackCost">1</span>
					</div>
				</div>
				
				<div id="rush" class="actionButtons row" 
					title="Deploy 2 troops using energy instead of production. Boosted by culture.">
					<div class="col-xs-9">
						<span class='text-hotkey'>R</span>ush Troops
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						</i><span id="rushCost">2</span>
					</div>
				</div>
				
				<div class="row actionHead shadow4">
					<i class="fa fa-gavel production resourceIcon"></i>Produce
				</div>
				
				<div id="deploy" class="actionButtons row" 
					title="Deploy troops to a tile">
					<div class="col-xs-9">
						<span class='text-hotkey'>D</span>eploy Troops
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='deployCost'>10</cost>
					</div>
				</div>
			
				<div id="upgradeTileDefense" class="actionButtons row" 
					title="Bunkers boost tile defense +5">
					<div class="col-xs-9">
						<span class='text-hotkey'>B</span>uild <span id="buildWord">Bunker</span>
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id="buildCost"></span>
					</div>
				</div>
				
				<div id="fireCannons" class="actionButtons row none"
					title="Fire cannons at an adjacent tile. Kills 2-4 troops.">
					<div class="col-xs-9">
						Fire <span class='text-hotkey'>C</span>annons
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='cannonsCost'>24</span>
					</div>
				</div>
				
				<div id="launchMissile" class="actionButtons row none"
					title="Launch a missile at any territory. Kills 7-12 troops.">
					<div class="col-xs-9">
						Launch <span class='text-hotkey'>M</span>issile
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='missileCost'>50</span>
					</div>
				</div>
				
				<div id="launchNuke" class="actionButtons row none" 
					title="Launch a nuclear weapon at any enemy territory. Kills 80-99% of troops and destroys all structures.">
					<div class="col-xs-9">Launch <span class='text-hotkey'>N</span>uke</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='nukeCost'>150</span>
					</div>
				</div>
				
				<div id="tileActionsOverlay"></div>
			
			</div>
			
			<div id="tileResearch" class="container w100">
				<div class="row actionHead shadow4">
					<i class="fa fa-gavel production resourceIcon"></i>Research
				</div>
				
				<div id="researchMasonry" class="actionButtons row" 
					title="Research masonry to unlock bunkers.">
					<div class="col-xs-9">
						Masonr<span class='text-hotkey'>y</span>
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='masonryCost'>40</span>
					</div>
				</div>
				
				<div id="researchConstruction" class="actionButtons row none" 
					title="Research construction to unlock walls.">
					<div class="col-xs-9">
						C<span class='text-hotkey'>o</span>nstruction
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='constructionCost'>60</span>
					</div>
				</div>
				
				<div id="researchEngineering" class="actionButtons row none" 
					title="Research engineering to unlock walls and fortresses.">
					<div class="col-xs-9">
						<span class='text-hotkey'>E</span>ngineering
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='engineeringCost'>80</span>
					</div>
				</div>
				
				<div id="researchGunpowder" class="actionButtons row" 
					title="Research gunpowder to unlock cannons.">
					<div class="col-xs-9">
						<span class='text-hotkey'>G</span>unpowder
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='gunpowderCost'>60</span>
					</div>
				</div>
				
				<div id="researchRocketry" class="actionButtons row none" 
					title="Research rocketry to unlock missiles.">
					<div class="col-xs-9">
						Roc<span class='text-hotkey'>k</span>etry
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='rocketryCost'>200</span>
					</div>
				</div>
				
				<div id="researchAtomicTheory" class="actionButtons row none" 
					title="Research atomic theory to unlock nuclear weapons.">
					<div class="col-xs-9">
						A<span class='text-hotkey'>t</span>omic Theory
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='atomicTheoryCost'>500</span>
					</div>
				</div>
				
				<div id="researchFutureTech" class="actionButtons row none" 
					title="Research future technology.">
					<div class="col-xs-9">
						<span class='text-hotkey'>F</span>uture Tech
					</div>
					<div class="col-xs-3 tight2 text-right productionCost">
						<span id='futureTechCost'>800</span>
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
		
		<div id="chat-input-wrap" class="input-group">
			<span class="input-group-addon fwBlue shadow4" id="chat-input-send">
				<i class="fa fa-send pointer2"></i>
			</span>
			<input id="chat-input" class="fw-text nobg" type='text' maxlength="240" autocomplete="off" spellcheck="false"/>
		</div>
		<button id="chat-input-open" class="btn fwBlue shadow4 gameWindow">
			<i class="fa fa-comment pointer2"></i>
		</button>
			
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
	
	<div id="hotkeysModal" class='fw-primary title-modals'>
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
				<div class='col-xs-4'>
					SHIFT+TAB
				</div>
				<div class='col-xs-8'>
					Previous Target
				</div>
				<div class='col-xs-4'>
					ENTER
				</div>
				<div class='col-xs-8'>
					Open Chat
				</div>
				<div class='col-xs-4'>
					ESC
				</div>
				<div class='col-xs-8'>
					Clear Chat/Target
				</div>
				<div class='col-xs-4'>
					V
				</div>
				<div class='col-xs-8'>
					Toggle UI
				</div>
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
	
	<div id="optionsModal" class='fw-primary title-modals'>
		<h2 class='header text-center'>Audio</h2>
		<hr class="fancyhr">
		<div id="optionsFormWrap" class="container w100">
		
			<div class='row buffer2'>
				<div class='col-xs-4'>
					Music Volume
				</div>
				<div class='col-xs-8 text-right'>
					<input id="musicSlider" class="sliders" type="text"/>
				</div>
				<div class='col-xs-4 buffer2'>
					Sound Effect Volume
				</div>
				<div class='col-xs-8 text-right buffer2'>
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
<script src="js/libs/bootstrap.min.js"></script>
<script src="js/libs/bootstrap-slider.min.js"></script>
<?php
	require $_SERVER['DOCUMENT_ROOT'] . '/includes/ga.php';
	echo '<script>
		var guest = '. $_SESSION['guest'] .';
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
				'ui',
				'payment',
				'stats',
				'animate',
				'core',
				'title',
				'lobby',
				'ws',
				'audio',
				'map',
				'actions',
				'events',
				'ai'
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