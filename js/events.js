var events = {
	core: (function(){
		$(window).focus(function(){
			document.title = g.defaultTitle;
			g.titleFlashing = false;
			if (g.notification.close !== undefined){
				g.notification.close();
			}
		});
		$(window).on('load', function(){
			setTimeout(function() {
				TweenMax.to('body', .3, {
					startAt: { display: 'flex', opacity: 0 },
					opacity: 1
				})
			}, 100);
			// background map
			TweenMax.to("#worldTitle", 600, {
				startAt: {
					xPercent: -50,
					yPercent: -50,
					rotation: -360
				},
				rotation: 0,
				repeat: -1,
				ease: Linear.easeNone
			});
		}).on('resize', function() {
			ui.resizeWindow();
		});
	})(),
	title: (function(){
		$("#mainWrap").on(ui.click, '.titlePlayerAccount, .lobbyAccountName', function(){
			title.who('/who '+ $(this).text());
		});
		$("#gameView").on('dragstart', 'img', function(e) {
			e.preventDefault();
		});
		$("img").on('dragstart', function(event) {
			event.preventDefault();
		});

		$("#logout").on(ui.click, function() {
			playerLogout();
			return false;
		});
		$("#login").on(ui.click, function(){
			title.presence.remove(my.account);
		});

		$("#titleMenu").on(ui.click, '.wars', function(){
			var gameName = $(this).data("name");
			$("#joinGame").val(gameName);
			$("#joinGamePassword").val('');
			title.joinGame();
		});
		
		function openCreateGameModal(mode){
			var e1 = document.getElementById('createGameHead'),
				e2 = document.getElementById('createRankedGameHead'),
				e3 = $("#gameName"),
				e4 = document.getElementById('createGameNameWrap'),
				e5 = document.getElementById('createGamePasswordWrap'),
				e6 = document.getElementById('createGameMaxPlayerWrap');
			
			g.rankedMode = 0;
			g.teamMode = 0;
			if (mode === 'ranked'){
				g.rankedMode = 1;
				e1.style.display = 'none';
				e2.style.display = 'block';
				e4.style.display = 'none';
				e5.style.display = 'none';
				e6.style.display = 'none';
			} else {
				e1.style.display = 'block';
				e2.style.display = 'none';
				e4.style.display = 'block';
				e5.style.display = 'block';
				e6.style.display = 'block';
			}
			if (mode === 'team'){
				g.teamMode = 1;
				e1.textContent = lang[my.lang].createTeamGameHeadLabel;
			}
			// e3.val(my.account +'_'+ ~~(Math.random()*999999)).select();
			e3.val('').select();
			$("#gamePassword").val('');
			TweenMax.to("#createGameWrap", g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop(e3);
			
			/*var speed = localStorage.getItem('gameSpeed2') === null ? 15 : localStorage.getItem('gameSpeed2');
			g.speed = speed;
			$("#createGameSpeed").text(speed);*/
		}
		$('#mainWrap').on(ui.click, '.chat-join', function(){
			socket.setChannel($(this).text());
		});
		$('#create').on(ui.click, function(){
			openCreateGameModal('ffa');
		});
		$('#createRankedBtn').on(ui.click, function(){
			openCreateGameModal('ranked');
		});
		$("#createTeamBtn").on(ui.click, function(){
			openCreateGameModal('team');
		});

		$("#createGame").on(ui.click, function(){
			title.createGame();
		});
		$("#play-now-btn").on(ui.click, function(){
			title.addCpu = 1;
			title.createGameService('', '', 'Alpha Earth', 8, 0, 0, 20);

		});
		$("body").on(ui.click, '#options, #gameOptions', function(){
			title.showModal();
		}).on(ui.click, '#hotkeys', function(){
			TweenMax.to("#hotkeysModal", g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		}).on(ui.click, '#hide-ui', function() {
			game.toggleGameWindows(1);
		}).on(ui.click, '#toggle-flags', function() {
			game.toggleFlags();
		}).on(ui.click, '#surrender', function(e){
			surrenderMenu();
		});
		$("#hotkeysDone, #optionsDone, #cancelCreateGame").on(ui.click, function(){
			title.closeModal();
		});


		// cached values on client to reduce DB load

		$("#joinPrivateGameModal").on(ui.click, "#joinPrivateGameBtnConfirm", title.joinGame);

		$("#titleMain").on(ui.click, '.nw-link', function() {
			title.openWindow($(this).attr('href'));
		});
		$("#titleChatPlayers").on(ui.click, '#friend-status', function(){
			title.listFriends();
		}).on(ui.click, '#ignore-status', function(){
			title.listIgnore();
		});
		$("#get-help").on(ui.click, function(){
			title.help();
			$("#title-chat-input").focus();
		});
		$("#ignore-user").on(ui.click, function(){
			$("#title-chat-input").val('/ignore ').focus();
		});
		$("#share-url").on(ui.click, function(){
			$("#title-chat-input").val('/url ').focus();
		});
		$("#share-image").on(ui.click, function(){
			$("#title-chat-input").val('/img ').focus();
		});
		$("#share-video").on(ui.click, function(){
			$("#title-chat-input").val('/video ').focus();
		});
		$("#who-account").on(ui.click, function(){
			$("#title-chat-input").val('/who ').focus();
		});
		$("#add-friend").on(ui.click, function(){
			$("#title-chat-input").val('/friend ').focus();
		});
		$("#whisper-account").on(ui.click, function(){
			$("#title-chat-input").val('@').focus();
		});
		$("#change-channel").on(ui.click, function(){
			$("#title-chat-input").val('#').focus();
		});
		
		$("#body").on(ui.click, "#cancelGame", function() {
			exitGame();
		}).on(ui.click, "#startGame", lobby.startGame)
		.on(ui.click, '.addFriend', function(){
			title.toggleFriend($(this).data('account'));
		}).on(ui.click, '.ribbon', function(){
			var x = $(this).data('ribbon') * 1;
			g.chat(lang[my.lang].ribbonTitle[x] +": "+ lang[my.lang].ribbonDescription[x], 'chat-warning');
		});
		$("#toggleNation").on(ui.click, title.configureNation);
		$("#joinPrivateGameBtn").on(ui.click, function(){
			var e = $("#joinGame");
			e.val('');
			TweenMax.to('#joinPrivateGameModal', g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1,
				onComplete: function(){
					e.focus();
				}
			});
			title.showBackdrop();
		});
		$("#mainWrap").on(ui.click, ".unlockGameBtn", function(){ 
			title.closeModal();
			TweenMax.to('#unlockGame', g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			setTimeout(function(){
				$("#card-number").focus();
			}, 100);
			title.showBackdrop();
		});
		$("#leaderboardBtn").on(ui.click, function(){
			TweenMax.to('#leaderboard', g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					top: 0,
					alpha: 0
				},
				top: 30,
				alpha: 1
			});
			title.showBackdrop();
			title.getLeaderboard('FFA');
		});
		// leaderboard buttons
		$("#leaderboardFfaBtn").on(ui.click, function(){
			title.getLeaderboard('FFA');
		});
		$("#leaderboardRankedBtn").on(ui.click, function(){
			title.getLeaderboard('Ranked');
		});
		$("#leaderboard-nation-rank").on(ui.click, function(){
			title.getLeaderboard('Nations');
		});
		$("#leaderboard-flag-rank").on(ui.click, function(){
			title.getLeaderboard('Flags');
		});
		$("#leaderboard-trips-btn").on(ui.click, function(){
			title.getLeaderboard('Trips');
		});
		$("#leaderboard-quads-btn").on(ui.click, function(){
			title.getLeaderboard('Quads');
		});
		$("#leaderboard-pents-btn").on(ui.click, function(){
			title.getLeaderboard('Pents');
		});
		$("#leaderboardTeamBtn").on(ui.click, function(){
			title.getLeaderboard('Team');
		});

		$("#window-select-wrap").on(ui.click, '.window-select', function() {
			ui.setWindow(this.id);
		});
		$("#bible-status").on(ui.click, function() {
			stats.setBibleMode($(this).prop('checked'));
		});
		$("#flagDropdown").on(ui.click, '.flagSelect', function(e){
			my.selectedFlag = $(this).find('a').data('flag').trim();
			my.selectedFlagFull = my.selectedFlag + ui.getFlagExt(my.selectedFlag);
			$("#updateNationFlag")
				.attr("src", "images/flags/" + my.selectedFlagFull)
				.css("display", "block");
			g.lock(1);
			$.ajax({
				url: app.url + 'php/updateFlag.php',
				data: {
					flag: my.selectedFlagFull
				}
			}).done(function(data) {
				my.flag = my.selectedFlagFull;
				$(".nationFlag").attr({
					src: "images/flags/" + my.selectedFlagFull,
					title: my.selectedFlag
				});
				g.msg(lang[my.lang].flagChanged + my.selectedFlag);
				document.getElementById('selectedFlag').textContent = my.selectedFlag;
				$("[title]")
					.tooltip('fixTitle')
					.tooltip({
						animation: false
					});
			}).always(function(){
				g.unlock(1);
				TweenMax.to("#updateNationFlag", 1, {
					startAt: {
						alpha: 0
					},
					alpha: 1
				});
			});
			e.preventDefault();
		});

		$("#lobbyPlayers").on(ui.click, '.flagSelect', function(e){
			var val = $(this).find('a').data('flag').trim();
			console.info(val);
			lobby.cpuFlag = val;
			$("#cpuFlag").html(val);
			e.preventDefault();
		});

		$("#submitNationName").on("mousedown", function(){
			title.submitNationName();
		});
		$("#updateNationName").on("focus", function(){
			g.focusUpdateNationName = true;
		}).on("blur", function(){
			g.focusUpdateNationName = false;
		});
		$("#refreshGameWrap").on("focus", "#gameName", function(){
			g.focusGameName = true;
		});
		$("#refreshGameWrap").on("blur", "#gameName", function(){
			g.focusGameName = false;
		});
		$("#titleViewBackdrop, .close-btn").on(ui.click, title.closeModal);

		$("#body").on(ui.click,
			'#updateNationBtn, #configureNationDone, #leaderboardDone',
			title.closeModal
		);
		/*
		$("#autoJoinGame").on(ui.click, function(){
			$("#joinGame").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-FFA").filter(":first").trigger(ui.click); 
			if (!$("#joinGame").val()){
				g.msg("No FFA games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		$("#joinTeamGame").on(ui.click, function(){
			$("#joinGame").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-Team").filter(":first").trigger(ui.click); 
			if (!$("#joinGame").val()){
				g.msg("No team games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		*/
		$("#joinRankedGame").on(ui.click, function(){
			audio.play('click');
			g.lock(1);
			g.searchingGame = true;
			g.msg(lang[my.lang].rankedSearch, 0);
			(function repeat(count){
				if (count < 1 && !g.joinedGame){
					setTimeout(function(){
						if (g.searchingGame){
							repeat(++count);
						}
					}, 1000);
					// ajax call to join ranked game
					$.ajax({
						url: app.url + 'php/joinRankedGame.php'
					}).done(function(data){
						if (g.searchingGame){
							TweenMax.set(DOM.Msg, {
								opacity: 0
							});
							g.joinedGame = 1;
							g.unlock();
							g.searchingGame = false;
							title.joinGameCallback(data);
						}
					});
				} else {
					if (!g.joinedGame && g.searchingGame){
						g.msg(lang[my.lang].noRankedFound, 5);
						g.unlock();
						g.searchingGame = false;
					}
				}
			})(0);
		});
	})(),
	lobby: (function(){
		$("#chat-input-open").on(ui.click, toggleChatMode);
		$("#chat-input-send").on(ui.click, function(){
			toggleChatMode(true);
		});
		$("#lobby-chat-input").on('focus', function(){
			lobby.chatOn = true;
		}).on('blur', function(){
			lobby.chatOn = false;
		});
		$("#lobbyChatSend").on(ui.click, function(){
			lobby.sendMsg(true);
		});
		// prevents auto scroll while scrolling
		$("#lobbyChatLog").on('mousedown', function(){
			lobby.chatDrag = true;
		}).on('mouseup', function(){
			lobby.chatDrag = false;
		});
		$("#joinGameLobby").on(ui.click, '.governmentChoice', function(e){
			// changes player's own government only
			var government = $(this).data('government');
			lobby.updateGovernmentWindow(government);
			$.ajax({
				url: app.url + "php/changeGovernment.php",
				data: {
					government: government
				}
			});
		}).on(ui.click, '.cpu-choice', function(){
			var difficulty = $(this).data('difficulty'),
				player = $(this).data('player');

			console.info('cpu-choice', difficulty);
			localStorage.setItem('lastDifficulty', difficulty);
			my.lastDifficulty = difficulty;
			document.getElementById('lobby-difficulty-cpu'+ player).textContent = difficulty;
			$.ajax({
				url: app.url + "php/change-cpu-difficulty.php",
				data: {
					difficulty: difficulty,
					player: $(this).data('player')
				}
			});
		}).on(ui.click, '.playerColorChoice', function(e){
			var playerColor = $(this).data('playercolor');
			$.ajax({
				url: app.url + 'php/changePlayerColor.php',
				data: {
					playerColor: playerColor*1
				}
			}).done(function(data){
				my.playerColor = data.playerColor;
			}).fail(function(data){
				g.msg(data.statusText, 1.5);
			});
		}).on(ui.click, '.teamChoice', function(){
			var team = $(this).text().slice(5),
				player = $(this).data('player');

			console.info("TEAM: ", player, team);
			// is it human player?
			for (var key in lobby.presence.list) {
				var v = lobby.presence.list[key];
				if (player === v.player && !v.cpu) {
					// cannot change other player's team
					return;
				}
			}

			$.ajax({
				url: app.url + 'php/changeTeam.php',
				data: {
					team: team,
					player: player
				}
			}).done(function(data) {
				if (my.player === data.player * 1) {
					my.team = data.team;
				}
				var obj = _.find(lobby.presence.list, function(v) {
					return v.player === data.player * 1;
				});
				console.info('obj ', obj);
				lobby.presence.list[obj.account].team = data.team;
			});
			
		}).on(ui.click, '#cpu-add-player', function() {
			lobby.addCpuPlayer();
		})
		.on(ui.click, '#cpu-remove-player', function() {
			lobby.removeCpuPlayer();
		});
	})(),
	map: (function(){
		$("body").on("mousewheel", function(e){
			if (g.view === 'game'){
				if (e.originalEvent.wheelDelta > 0) {
					mouseZoomIn(e);
				}
				else if (e.originalEvent.wheelDelta < 0) {
					mouseZoomOut(e);
				}
				setMousePosition(e.offsetX, e.offsetY);
				applyBounds();
			}
		});

		$("#worldWrap").on("mousemove", function(e){
			setMousePosition(e.offsetX, e.offsetY);
		});
		$("#createGameWrap").on(ui.click, '.mapSelect', function(e){
			var x = $(this).text();
			var key = x.replace(/ /g,'');
			g.map.name = x;
			g.map.key = key;
			document.getElementById('createGameMap').innerHTML = x;
			// $('#createGameTiles').html(title.mapData[key].tiles);
			document.getElementById('createGamePlayers').innerHTML = title.mapData[key].players;
			var e1 = $("#gamePlayers");
			e1.attr("max", title.mapData[key].players);
			if (e1.val() * 1 > title.mapData[key].players){
				e1.val(title.mapData[key].players);
			}
			e.preventDefault();
		});
		$("#mainWrap").on(ui.click, '.gameSelect', function(e){
			e.preventDefault();
		});
	})(),
	audio: (function(){
		$("#bgmusic").on('ended', function() {
			var x = document.getElementById('bgmusic');
			x.currentTime = 0;
			x.play();
		});
		$("#bgamb1").on('ended', function() {
			var x = document.getElementById('bgamb1');
			x.currentTime = 0;
			x.play();
		});
		$("#bgamb2").on('ended', function() {
			var x = document.getElementById('bgamb2');
			x.currentTime = 0;
			x.play();
		});
	})(),
	game: (function(){
		$("#cancelSurrenderButton").on(ui.click, function(){
			audio.play('click');
			document.getElementById('surrenderScreen').style.display = 'none';
		});
		$("#surrenderButton").on(ui.click, function() {
			surrender();
		});
	})()
};


$(document).on('keydown', function(e){
	var x = e.keyCode;
	console.info('keydown: ', x);
	if (e.ctrlKey){
		if (x === 82){
			// ctrl+r refresh
			return false;
		}
	}
	else {
		if (g.view === 'title'){
			if (!g.isModalOpen && isLoggedIn){
				$("#title-chat-input").focus();
			}
			if (x === 27) {
				title.toggleModal();
			}
		}
		else if (g.view === 'lobby'){
			$("#lobby-chat-input").focus();
			if (x === 27) {
				title.toggleModal();
			}
		}
		else {
			// game
			if (x === 86){
				// v
				if (!g.chatOn){
					game.toggleGameWindows(1);
				}
			}
			// STUFF BEFORE HERE CAN BE DONE IN SPECTATE MODE
			if (g.spectateStatus) return;
			if (x === 9){
				// tab
				if (!e.shiftKey){
					my.nextTarget(false);
				} else {
					my.nextTarget(true);
				}
				e.preventDefault();
			}
			else if (x === 27) {
				!my.attackOn && !g.chatOn && title.toggleModal();
			}
		}
	}
}).on('keyup', function(e) {
	var x = e.keyCode;
	console.info('keyup: ', x);
	if (g.view === 'title'){
		if (x === 13){
			if (g.focusUpdateNationName){
				title.submitNationName();
			} else if (g.focusGameName){
				title.createGame();
			} else if (title.chatOn){
				if (x === 13){
					// enter - sends chat
					title.sendMsg();
				}
			} else if (title.createGameFocus){
				title.createGame();
			}
		}
	}
	else if (g.view === 'lobby'){
		if (lobby.chatOn){
			if (x === 13){
				// enter - sends chat
				lobby.sendMsg();
			}
		}
	// game hotkeys
	}
	else if (g.view === 'game'){
		if (g.chatOn){
			if (x === 13 || x === 27){
				// enter/esc - sends chat
				toggleChatMode(true);
			}
		}
		else {
			if (x === 13){
				// enter
				toggleChatMode();
			}
			if (x === 27){
				// esc
				if (my.attackOn) {
					my.attackOn = false;
					my.attackName = '';
					my.clearHud();
					ui.showTarget(DOM['land' + my.tgt]);
				}
			}
			// STUFF BEFORE HERE CAN BE DONE IN SPECTATE MODE
			if (g.spectateStatus) return;
			if (x === 65){
				// a
				var o = new Target();
				action.target(o);
			}
			else if (x === 83){
				// s
				var o = new Target({
					cost: 1, 
					attackName: 'splitAttack',
					hudMsg: lang[my.lang].hudSplitAttack,
					splitAttack: true
				});
				console.info(o.cost);
				action.target(o);
			}
			else if (x === 68){
				// d
				if (!g.keyLock){
					action.deploy();
				}
			}
			else if (x === 82){
				// r
				if (!g.keyLock){
					if (e.ctrlKey){
						var x = my.lastReceivedWhisper;
						if (x){
							if (g.view === 'title'){
								$("#title-chat-input").val('/w ' + x + ' ').focus();
							}
							else if (g.view === 'lobby'){
								$("#lobby-chat-input").val('/w ' + x + ' ').focus();
							}
							else {
								if (!g.chatOn){
									toggleChatMode();
								}
								$("#chat-input").val('/w ' + x + ' ').focus();
							}
						}
						return false;
					}
					else {
						action.rush();
					}
				}
			}
			else if (x === 89){
				// y
				research.masonry();
			}
			else if (x === 79){
				// o
				research.construction();
			}
			else if (x === 69){
				// e
				research.engineering();
			}
			else if (x === 71){
				// g
				research.gunpowder();
			}
			else if (x === 75){
				// k
				research.rocketry();
			}
			else if (x === 84){
				// t
				research.atomicTheory();
			}
			else if (x === 70){
				// f
				research.futureTech();
			}
			else if (x === 66){
				// b
				action.upgradeTileDefense();
			}
			else if (x === 67 && my.tech.gunpowder){
				// c
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'cannons',
					hudMsg: lang[my.lang].hudFireCannons
				});
				action.target(o);
			}
			else if (x === 77 && my.tech.rocketry){
				// m
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'missile',
					hudMsg: lang[my.lang].hudLaunchMissile
				});
				action.target(o);
			}
			else if (x === 78 && my.tech.atomicTheory){
				// n
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'nuke',
					hudMsg: lang[my.lang].hudLaunchNuke
				});
				action.target(o);
			}
		}
	}
});

/*$("#dictatorAvatar").on('change', function(e){
	 var e2 = $("#uploadErr");
	 function imgError(msg){
		e2.html(msg);
		audio.play('error');
	 }
	 var file = e.target.files[0];
	 var reader = new FileReader();
	 reader.readAsDataURL(file);
	 if (file.type !== 'image/jpeg'){
		imgError('Wrong file type! Image must be in jpg format.');
	 }
	 else {
		 reader.addEventListener("load", function(){
			if (reader.result.length < 70000){
				$.ajax({
					url: app.url + "php/uploadDictator.php",
					type: "POST",
					data: {
						uri: reader.result
					},
					beforeSend: function(){
						e2.text('');
					}
				}).done(function(data){
					e2.text("Avatar updated successfully!");
					document.getElementById('configureAvatarImage').src = reader.result;
				}).fail(function(data){
					imgError(data.statusText);
				});
			} else {
				imgError('File size too large! Image must be less than 40 kb.');
				e2.html();
			}
		 }, false);
	 }
 });*/
if (app.isApp) {
	var gui = require('nw.gui');
	win = gui.Window.get();
	win.on('close', function() {
		this.hide(); // pretend
		title.closeGame();
		this.close(true);
	});
	$(".nwjs-link").on('click', function(e) {
		console.info("CLICK: ", this);
		require('nw.gui').Shell.openExternal(this.href);
		return false;
	});
}