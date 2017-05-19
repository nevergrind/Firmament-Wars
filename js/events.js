var events = {
	core: (function(){
		$(window).focus(function(){
			document.title = g.defaultTitle;
			g.titleFlashing = false;
			if (g.notification.close !== undefined){
				g.notification.close();
			}
		});
		$(window).on('resize orientationchange focus', function() {
			resizeWindow();
		}).on('load', function(){
			resizeWindow();
			// background map
			if (isMobile){
				document.getElementById('worldTitle').style.display = 'none';
				TweenMax.set('#worldTitle', {
					xPercent: -50,
					yPercent: -50,
					top: '50%',
					left: '50%',
					width: '1600px',
					height: '1600px'
				});
			} else {
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
			}
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
			socket.removePlayer(my.account);
			$.ajax({
				type: 'GET',
				url: 'php/deleteFromFwtitle.php'
			});
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
				e1.textContent = 'Create Team Game';
			}
			e3.val(my.account +'_'+ ~~(Math.random()*999999)).select();
			TweenMax.to(document.getElementById("createGameWrap"), g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop(e3);
			
			var speed = localStorage.getItem('gameSpeed2') === null ? 15 : localStorage.getItem('gameSpeed2');
			g.speed = speed;
			$("#createGameSpeed").text(speed);
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
			title.createGameService(my.account +'_'+ ~~(Math.random()*999999), '', 'Earth Omega', 8, 0, 0, 20);
			setTimeout(function(){
				lobby.addCpuPlayer();
			}, 500);
			
		});
		$("body").on(ui.click, '#options', function(){
			TweenMax.to(document.getElementById("optionsModal"), g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		}).on(ui.click, '#hotkeys', function(){
			TweenMax.to(document.getElementById("hotkeysModal"), g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		}).on(ui.click, '#resync', function(){
			window.onbeforeunload = null;
			localStorage.setItem('resync', 1);
			location.reload();
		});
		$("#hotkeysDone, #optionsDone, #cancelCreateGame").on(ui.click, function(){
			title.closeModal();
		});


		// cached values on client to reduce DB load

		$("#joinPrivateGameModal").on(ui.click, "#joinPrivateGameBtn", function(){
			title.joinGame();
		});

		// events for title-chat buttons
		$("#refresh-game-button").on(ui.click, function(){
			title.refreshGames();
			$("#title-chat-input").focus();
		});
		$("#titleChatPlayers").on(ui.click, '#friend-status', function(){
			title.listFriends();
			$("#title-chat-input").focus();
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
		
		$("#body").on(ui.click, "#cancelGame", function(){
			exitGame();
		}).on(ui.click, "#startGame", function(){
			lobby.startGame();
		}).on(ui.click, '.addFriend', function(){
			title.toggleFriend($(this).data('account'));
		}).on(ui.click, '.ribbon', function(){
			var x = $(this).data('ribbon') * 1;
			g.chat(game.ribbonTitle[x] +": "+ game.ribbonDescription[x], 'chat-warning'); 
		});
		$("#toggleNation").on(ui.click, function(){
			$.ajax({
				url: 'php/loadAvatar.php',
			}).done(function(data){
				document.getElementById('configureAvatarImage').src = data.uri;
			});
			TweenMax.to('#configureNation', g.modalSpeed, {
				startAt: {
					visibility: 'visible',
					y: 0,
					alpha: 0
				},
				y: 30,
				alpha: 1
			});
			title.showBackdrop();
		});
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
			TweenMax.to(document.getElementById('leaderboard'), g.modalSpeed, {
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
		$("#leaderboardFFABtn").on(ui.click, function(){
			title.getLeaderboard('FFA');
		});
		$("#leaderboardRankedBtn").on(ui.click, function(){
			title.getLeaderboard('Ranked');
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
		$("#endTurn").on(ui.click, function(){
			action.endTurn();
		});

		$("#flagDropdown").on(ui.click, '.flagSelect', function(e){
			my.selectedFlag = $(this).text();
			my.selectedFlagFull = my.selectedFlag === "Nepal" ? my.selectedFlag+".png" : my.selectedFlag+".jpg";
			$(".flagPurchaseStatus").css("display", "none");
			$("#updateNationFlag")
				.attr("src", "images/flags/" + my.selectedFlagFull)
				.css("display", "block");
			g.lock(1);
			$.ajax({
				url: 'php/updateFlag.php',
				data: {
					flag: my.selectedFlagFull
				}
			}).done(function(data) {
				my.flag = my.selectedFlagFull;
				$(".nationFlag").attr({
					src: "images/flags/" + my.selectedFlagFull,
					title: my.selectedFlag
				});
				Msg("Your nation's flag is now: " + my.selectedFlag);
				document.getElementById('selectedFlag').textContent = my.selectedFlag;
				if (!isMobile){
					$("[title]")
						.tooltip('fixTitle')
						.tooltip({
							animation: false
						});
				}
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
		$("#titleViewBackdrop").on(ui.click, function(){
			title.closeModal();
		});
		$("#mainWrap").on(ui.click, '#unlockGameDone, #configureNationDone, #leaderboardDone', function(){
			audio.play('click');
			title.closeModal();
		});
		/*
		$("#autoJoinGame").on(ui.click, function(){
			$("#joinGame").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-FFA").filter(":first").trigger(ui.click); 
			if (!$("#joinGame").val()){
				Msg("No FFA games found!", 1.5);
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
				Msg("No team games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		*/
		$("#overlay").on(ui.click, function(){
			g.searchingGame = false;
			TweenMax.set(DOM.Msg, {
				opacity: 0
			});
			g.unlock();
		});
		$("#joinRankedGame").on(ui.click, function(){
			audio.play('click');
			g.lock();
			g.searchingGame = true;
			Msg("Searching for ranked games...", 0);
			(function repeat(count){
				if (count < 4 && !g.joinedGame){
					setTimeout(function(){
						if (g.searchingGame){
							repeat(++count);
						}
					}, 1000);
					// ajax call to join ranked game
					$.ajax({
						url: 'php/joinRankedGame.php'
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
						Msg("No ranked games found! Try creating a ranked game instead.", 5);
						g.unlock();
						g.searchingGame = false;
					}
				}
			})(0);
		});
	})(),
	lobby: (function(){
		$("#chat-input-open").on(ui.click, function(){
			toggleChatMode();
		});
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
			var government = $(this).text();
			lobby.updateGovernmentWindow(government);
			$.ajax({
				url: "php/changeGovernment.php",
				data: {
					government: government
				}
			});
		}).on(ui.click, '.cpu-choice', function(e){
			var difficulty = $(this).text();
			$.ajax({
				url: "php/change-cpu-difficulty.php",
				data: {
					difficulty: difficulty,
					player: $(this).data('player')
				}
			});
		}).on(ui.click, '.playerColorChoice', function(e){
			var playerColor = $(this).data('playercolor');
			$.ajax({
				url: 'php/changePlayerColor.php',
				data: {
					playerColor: playerColor*1
				}
			}).done(function(data){
				my.playerColor = data.playerColor;
			}).fail(function(data){
				Msg(data.statusText, 1.5);
			});
		}).on(ui.click, '.teamChoice', function(e){
			var team = $(this).text().slice(5),
				player = $(this).data('player');
			console.info("TEAM: ", team, player);
			$.ajax({
				url: 'php/changeTeam.php',
				data: {
					team: team,
					player: player
				}
			}).done(function(data) {
				my.team = data.team;
			});
			
		}).on(ui.click, '#cpu-add-player', function(e){
			//console.info("Adding player");
			audio.play('click');
			lobby.addCpuPlayer();
		}).on(ui.click, '#cpu-remove-player', function(e){
			//console.info("Removing player");
			audio.play('click');
			$.ajax({
				url: 'php/cpu-remove-player.php' 
			});
		});
	})(),
	map: (function(){
		if (!isFirefox){
			$("body").on("mousewheel", function(e){
				if (g.view === 'game'){
					setMousePosition(e.offsetX, e.offsetY);
					worldMap[0].applyBounds();
				}
			});
			$("#worldWrap").on("mousewheel", function(e){
				e.originalEvent.wheelDelta > 0 ? mouseZoomIn(e) : mouseZoomOut(e);
				worldMap[0].applyBounds();
			});
		} else {
			$("body").on("DOMMouseScroll", function(e){
				if (g.view === 'game'){
					setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
					worldMap[0].applyBounds();
				}
			});
			$("#worldWrap").on("DOMMouseScroll", function(e){
				e.originalEvent.detail > 0 ? mouseZoomOut(e) : mouseZoomIn(e);
				worldMap[0].applyBounds();
			});
		}

		$("#worldWrap").on("mousemove", function(e){
			if (isFirefox){
				setMousePosition(e.originalEvent.layerX, e.originalEvent.layerY);
			} else {
				setMousePosition(e.offsetX, e.offsetY);
				//console.info(e.offsetX, e.offsetY);
			}
		});
		$("#resources-ui").on(ui.click, '#surrender', function(e){
			surrenderMenu(); 
		});
		$("#createGameWrap").on(ui.click, '.mapSelect', function(e){
			var x = $(this).text();
			var key = x.replace(/ /g,'');
			g.map.name = x;
			g.map.key = key;
			document.getElementById('createGameMap').innerHTML = x;
			document.getElementById('createGameTiles').innerHTML = title.mapData[key].tiles;
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
		$("#mainWrap").on(ui.click, '.speedSelect', function(e){
			var x = $(this).text()*1;
			g.speed = x;
			$("#createGameSpeed").text(x);
			localStorage.setItem('gameSpeed2', x);
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
		$("#surrenderButton").on(ui.click, function(){
			surrender();
		});
	})()
};


$(document).on('keydown', function(e){
	var x = e.keyCode;
	if (e.ctrlKey){
		if (x === 82){
			// ctrl+r refresh
			return false;
		}
	} else {
		if (g.view === 'title'){
			if (!g.isModalOpen){
				$("#title-chat-input").focus();
			}
		} else if (g.view === 'lobby'){
			$("#lobby-chat-input").focus();
		} else {
			// game
			if (x === 9){
				// tab
				if (!e.shiftKey){
					my.nextTarget(false);
				} else {
					my.nextTarget(true);
				}
				e.preventDefault();
			} else if (x === 86){
				// v
				if (g.view === 'game' && !g.chatOn){
					game.toggleGameWindows(1);
				}
			}
		}
	}
}).on('keyup', function(e) {
	var x = e.keyCode;
	//console.info(x);
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
		} else if (x === 27){
			// esc
			title.closeModal();
		}
	} else if (g.view === 'lobby'){
		if (lobby.chatOn){
			if (x === 13){
				// enter - sends chat
				lobby.sendMsg();
			}
		}
	// game hotkeys
	} else if (g.view === 'game'){
		if (g.chatOn){
			if (x === 13){
				// enter/esc - sends chat
				toggleChatMode(true);
			} else if (x === 27){
				// esc
				toggleChatMode();
			}
		} else {
			if (x === 13){
				// enter
				toggleChatMode();
			}  else if (x === 27){
				// esc
				my.attackOn = false;
				my.attackName = '';
				my.clearHud();
				ui.showTarget(DOM['land' + my.tgt]); 
				//console.clear();
			} else if (x === 65){
				// a
				var o = new Target();
				action.target(o);
			} else if (x === 83){
				// s
				var o = new Target({
					cost: 1, 
					attackName: 'splitAttack',
					hudMsg: 'Split Attack: Select Target',
					splitAttack: true
				});
				console.info(o.cost);
				action.target(o);
			} else if (x === 68){
				// d
				if (!g.keyLock){
					action.deploy();
				}
			} else if (x === 82){
				// r
				if (!g.keyLock){
					if (e.ctrlKey){
						var x = my.lastReceivedWhisper;
						if (x){
							if (g.view === 'title'){
								$("#title-chat-input").val('/w ' + x + ' ').focus();
							} else if (g.view === 'lobby'){
								$("#lobby-chat-input").val('/w ' + x + ' ').focus();
							} else {
								if (!g.chatOn){
									toggleChatMode();
								}
								$("#chat-input").val('/w ' + x + ' ').focus();
							}
						}
						return false;
					} else {
						action.rush();
					}
				}
			} else if (x === 89){
				// y
				research.masonry();
			} else if (x === 79){
				// o
				research.construction();
			} else if (x === 69){
				// e
				research.engineering();
			} else if (x === 71){
				// g
				research.gunpowder();
			} else if (x === 75){
				// k
				research.rocketry();
			} else if (x === 84){
				// t
				research.atomicTheory();
			} else if (x === 70){
				// f
				research.futureTech();
			} else if (x === 66){
				// b
				action.upgradeTileDefense();
			} else if (x === 67){
				// c
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'cannons',
					hudMsg: 'Fire Cannons'
				});
				action.target(o);
			} else if (x === 77){
				// m
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'missile',
					hudMsg: 'Launch Missile'
				});
				action.target(o);
			} else if (x === 78){
				// n
				var o = new Target({
					cost: 0,
					minimum: 0,
					attackName: 'nuke',
					hudMsg: 'Launch Nuclear Weapon'
				});
				action.target(o);
			}
		}
	}
});

 $("#dictatorAvatar").on('change', function(e){
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
	 } else {
		 reader.addEventListener("load", function(){
			if (reader.result.length < 64000){
				$.ajax({
					url: "php/uploadDictator.php",
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
 });