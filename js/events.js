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
		});
	})(),
	title: (function(){
		$("#mainWrap").on('click', '.titlePlayerAccount, .lobbyAccountName', function(){
			title.who('/who '+ $(this).text());
		});
		$("#gameView").on('dragstart', 'img', function(e) {
			e.preventDefault();
		});
		$("img").on('dragstart', function(event) {
			event.preventDefault();
		});

		$("#logout").on('click', function() {
			playerLogout();
			return false;
		});

		$("#titleMenu").on("click", ".wars", function(){
			var gameName = $(this).data("name");
			$("#joinGameName").val(gameName);
			$("#joinGamePassword").val('');
		}).on("dblclick", ".wars", function(){
			var gameName = $(this).data("name");
			$("#joinGameName").val(gameName);
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
			e3.val('');
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
			
			var speed = localStorage.getItem('gameSpeed');
			newSpeed = g.speeds[speed];
			if (newSpeed >= 5000){
				g.speed = newSpeed;
				$("#createGameSpeed").text(speed);
			}
			
		}
		$("#mainWrap").on('click', '.chat-join', function(){
			socket.setChannel($(this).text());
		});
		$("#create").on("click", function(){
			openCreateGameModal('ffa');
		});
		$("#createRankedBtn").on("click", function(){
			openCreateGameModal('ranked');
		});
		$("#createTeamBtn").on("click", function(){
			openCreateGameModal('team');
		});

		$("#createGame").on("click", function(e){
			title.createGame();
		});
		$("body").on("click", '#options', function(){
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
		}).on("click", '#hotkeys', function(){
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
		});
		$("#hotkeysDone, #optionsDone, #cancelCreateGame").on("click", function(){
			title.closeModal();
		});


		// cached values on client to reduce DB load

		$("#titleMenu").on("click", "#joinGame", function(){
			title.joinGame();
		});

		$("#mainWrap").on("click", "#cancelGame", function(){
			exitGame();
		}).on("click", "#startGame", function(){
			lobby.startGame();
		});
		$("#toggleNation").on("click", function(){
			var foo = new Image();
			foo.src = 'php/avatars/'+ ~~(nationRow / 10000) +'/'+ nationRow +'.jpg';
			foo.onload = function(){
				document.getElementById('configureAvatarImage').src = 'php/avatars/'+ ~~(nationRow / 10000) +'/'+ nationRow +'.jpg';
			};
			TweenMax.to(configureNation, g.modalSpeed, {
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
		$("#mainWrap").on("click", ".unlockGameBtn", function(){
			title.closeModal();
			var e = document.getElementById("unlockGame");
			TweenMax.to(e, g.modalSpeed, {
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
		$("#leaderboardBtn").on('click', function(){
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
			var e3 = document.getElementById('leaderboardBody');
			$.ajax({
				url: 'php/leaderboard.php'
			}).done(function(data) {
				e3.innerHTML = data.str;
			});
		});

		$("#flagDropdown").on('click', '.flagSelect', function(e){
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
		$("#titleViewBackdrop").on('click', function(){
			title.closeModal();
		});
		$("#mainWrap").on('click', '#unlockGameDone, #configureNationDone, #leaderboardDone', function(){
			audio.play('click');
			title.closeModal();
		});
		$("#autoJoinGame").on('click', function(){
			$("#joinGameName").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-FFA").filter(":first").trigger("click"); 
			console.info($(".wars-FFA"));
			if (!$("#joinGameName").val()){
				Msg("No FFA games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		$("#joinTeamGame").on('click', function(){
			$("#joinGameName").val('');
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars-Team").filter(":first").trigger("click"); 
			console.info($(".wars-Team"));
			if (!$("#joinGameName").val()){
				Msg("No team games found!", 1.5);
			} else {
				title.joinGame();
			}
		});
		$("#overlay").on('click', function(){
			g.searchingGame = false;
			TweenMax.set(DOM.Msg, {
				opacity: 0
			});
			g.unlock();
		});
		$("#joinRankedGame").on('click', function(){
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
					}).fail(function(data){
						console.info(data);
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
		$("#lobby-chat-input").on('focus', function(){
			lobby.chatOn = true;
		}).on('blur', function(){
			lobby.chatOn = false;
		});
		$("#lobbyChatSend").on('click', function(){
			lobby.sendMsg(true);
		});
		// prevents auto scroll while scrolling
		$("#lobbyChatLog").on('mousedown', function(){
			lobby.chatDrag = true;
		}).on('mouseup', function(){
			lobby.chatDrag = false;
		});
		$("#joinGameLobby").on('click', '.governmentChoice', function(e){
			// changes player's own government only
			var government = $(this).text();
			lobby.updateGovernmentWindow(government);
			$.ajax({
				url: "php/changeGovernment.php",
				data: {
					government: government
				}
			});
			e.preventDefault();
		}).on('click', '.playerColorChoice', function(e){
			var playerColor = $(this).data('playercolor');
			$.ajax({
				url: 'php/changePlayerColor.php',
				data: {
					playerColor: playerColor*1
				}
			}).done(function(data) {
				my.playerColor = data.playerColor;
			}).fail(function(data){
				Msg(data.statusText, 1.5);
			});
		}).on('click', '.teamChoice', function(e){
			var team = $(this).text().slice(5);
			console.info("TEAM: ", team);
			$.ajax({
				url: 'php/changeTeam.php',
				data: {
					team: team
				}
			}).done(function(data) {
				my.team = data.team;
			}).fail(function(data){
				Msg(data.statusText, 1.5);
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
		$("#resources-ui").on('click', '#surrender', function(e){
			surrenderMenu(); 
		});
		$("#createGameWrap").on('click', '.mapSelect', function(e){
			var x = $(this).text();
			var key = x.replace(/ /g,'');
			g.map.name = x;
			g.map.key = key;
			if (fwpaid){
				document.getElementById('createGameMap').innerHTML = x;
				document.getElementById('createGameTiles').innerHTML = title.mapData[key].tiles;
				document.getElementById('createGamePlayers').innerHTML = title.mapData[key].players;
				var e1 = $("#gamePlayers");
				e1.attr("max", title.mapData[key].players);
				if (e1.val() * 1 > title.mapData[key].players){
					e1.val(title.mapData[key].players);
				}
			} else {
				Msg("Unlock the complete game for access to all maps.");
			}
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.gameSelect', function(e){
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.speedSelect', function(e){
			var x = $(this).text();
			g.speed = g.speeds[x];
			$("#createGameSpeed").text(x);
			localStorage.setItem('gameSpeed', x);
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
		$("#cancelSurrenderButton").on('click', function(){
			audio.play('click');
			document.getElementById('surrenderScreen').style.display = 'none';
		});
		$("#surrenderButton").on('click', function(){
			surrender();
		});
	})()
};


$(document).on('keydown', function(e){
	var x = e.keyCode;
	if (e.ctrlKey){
		if (x === 82){
			return false;
		}
	} else {
		if (x === 9){
			// tab
			if (g.view === 'game'){
				if (!e.shiftKey){
					my.nextTarget(false);
				} else {
					my.nextTarget(true);
				}
				e.preventDefault();
			}
		} else if (x === 86){
			if (g.view === 'game'){
				game.toggleGameWindows(1);
			}
		}
	}
});
$(document).on('keyup', function(e) {
	var x = e.keyCode;
	//console.info(g.view, x);
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
			// game hotkeys
			if (x === 13){
				// enter
				toggleChatMode();
			}  else if (x === 27){
				// esc
				my.attackOn = false;
				my.attackName = '';
				my.clearHud();
				showTarget(DOM['land' + my.tgt]); 
				console.clear();
			} else if (x === 65){
				// a
				var o = new Target();
				action.target(o);
			} else if (x === 83){
				// s
				var o = new Target({
					cost: 3, 
					splitAttack: true
				});
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
					cost: 40 * my.weaponCost,
					minimum: 0,
					attackName: 'cannons',
					hudMsg: 'Fire Cannons'
				});
				action.target(o);
			} else if (x === 77){
				// m
				var o = new Target({
					cost: 60 * my.weaponCost,
					minimum: 0,
					attackName: 'missile',
					hudMsg: 'Launch Missile'
				});
				action.target(o);
			} else if (x === 78){
				// n
				var o = new Target({
					cost: 400 * my.weaponCost,
					minimum: 0,
					attackName: 'nuke',
					hudMsg: 'Launch Nuclear Weapon'
				});
				action.target(o);
			}
		}
	}
});

 $("#uploadDictator").on('submit', function(e){
	e.preventDefault();
	console.info("UPLOAD IMAGE");
	$.ajax({
		url: "php/uploadDictator.php",
		type: "POST",
		data:  new FormData(this),
		contentType: false,
		cache: false,
		processData:false,
		beforeSend: function(){
			$("#uploadErr").text('');
		}
	}).done(function(data){
		console.info("IMAGE: ", 'php/'+ data);
		$("#uploadErr").text("Avatar updated successfully!");
		document.getElementById('configureAvatarImage').src = 'php/'+ data +'?v='+ Date.now(); 
	}).fail(function(data){
		console.info("FAIL: ", data);
		$("#uploadErr").html(data.statusText);
	});
 });