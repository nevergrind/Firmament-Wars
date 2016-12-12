var events = {
	core: (function(){
		$(window).focus(function(){
			document.title = g.defaultTitle;
			g.titleFlashing = false;
			if (g.notification.close !== undefined){
				g.notification.close();
			}
		});
		$(window).on('resize orientationchange', function() {
			resizeWindow();
		}).on('load', function(){
			resizeWindow();
			// background map
			TweenMax.to("#worldTitle", 300, {
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
		
		function openCreateGameModal(isRanked){
			var e1 = document.getElementById('createGameHead'),
				e2 = document.getElementById('createRankedGameHead'),
				e3 = $("#gameName"),
				e4 = document.getElementById('createGameNameWrap'),
				e5 = document.getElementById('createGamePasswordWrap'),
				e6 = document.getElementById('createGameMaxPlayerWrap');
				
			g.rankedGame = isRanked ? 1 : 0;
			if (isRanked){
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
			e3.val('');
			TweenMax.to(document.getElementById("createGameWrap"), .5, {
				startAt: {
					visibility: 'visible',
					scale: .8,
					alpha: 0
				},
				scale: 1,
				alpha: 1
			});
			TweenMax.to(document.getElementById("titleViewBackdrop"), .25, {
				startAt: {
					visibility: 'visible',
					opacity: 0
				},
				opacity: 1,
				ease: Linear.easeNone,
				onComplete: function(){
					e3.focus();
				}
			});
			g.isModalOpen = true;
		}

		$("#create").on("click", function(){
			openCreateGameModal(false);
		});
		$("#createRankedBtn").on("click", function(){
			openCreateGameModal(true);
		});

		$("#createGame").on("mousedown", function(e){
			title.createGame();
		});
		$("body").on("click", '#options', function(){
			TweenMax.to(document.getElementById("optionsModal"), .5, {
				startAt: {
					visibility: 'visible',
					scale: .8,
					alpha: 0
				},
				scale: 1,
				alpha: 1
			});
			TweenMax.to(document.getElementById("titleViewBackdrop"), .25, {
				startAt: {
					visibility: 'visible',
					opacity: 0
				},
				opacity: 1,
				ease: Linear.easeNone
			});
			g.isModalOpen = true;
		});
		$("#optionsDone, #cancelCreateGame").on("click", function(){
			title.hideBackdrop();
		});


		// cached values on client to reduce DB load

		$("#titleMenu").on("click", "#joinGame", function(){
			title.joinGame();
		});

		$("#mainWrap").on("click", "#cancelGame", function(){
			exitGame();
		}).on("click", "#startGame", function(){
			startGame();
		});
		$("#toggleNation").on("click", function(){
			var e = document.getElementById("configureNation"),
				e2 = document.getElementById("titleViewBackdrop");
			TweenMax.to(e, .5, {
				startAt: {
					visibility: 'visible',
					scale: .8,
					alpha: 0
				},
				scale: 1,
				alpha: 1
			});
			TweenMax.to(e2, .5, {
				startAt: {
					visibility: 'visible',
					opacity: 0
				},
				opacity: 1
			});
			g.isModalOpen = true;
		});
		$("#leaderboardBtn").on('click', function(){
			var e = document.getElementById("leaderboard"),
				e2 = document.getElementById("titleViewBackdrop");
			TweenMax.to(e, .5, {
				startAt: {
					visibility: 'visible',
					scale: .8,
					alpha: 0
				},
				scale: 1,
				alpha: 1
			});
			TweenMax.to(e2, .5, {
				startAt: {
					visibility: 'visible',
					opacity: 0
				},
				opacity: 1
			});
			g.isModalOpen = true;
			var e3 = document.getElementById('leaderboardBody');
			$.ajax({
				url: 'php/leaderboard.php',
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
				$("#offerFlag").css("display", "none");
				$(".nationFlag").attr({
					src: "images/flags/" + my.selectedFlagFull,
					title: my.selectedFlag
				});
				$("#flagPurchased").css("display", "block");
				Msg("Your nation's flag is now: " + my.selectedFlag);
				document.getElementById('selectedFlag').textContent = my.selectedFlag;
				$("[title]").tooltip('fixTitle');
			}).fail(function(e){
				$("#flagPurchased").css("display", "none");
				$("#offerFlag").css("display", "block");
			}).always(function(){
				g.unlock(1);
				TweenMax.fromTo("#updateNationFlag", 1, {
					alpha: .25,
					scale: .9
				}, {
					alpha: 1,
					scale: 1
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
		})
		$("#refreshGameWrap").on("blur", "#gameName", function(){
			g.focusGameName = false;
		});

		$("#buyFlag").on("click", function(){
			g.lock();
			$.ajax({
				url: 'php/buyFlag.php',
				data: {
					flag: my.selectedFlagFull
				}
			}).done(function(data) {
				$("#crystalCount").text(data);
				$("#flagPurchased").css("display", "block");
				$("#offerFlag").css("display", "none");
				$(".nationFlag").attr({
					src: "images/flags/" + my.selectedFlagFull,
					title: my.selectedFlag
				});
				Msg("Your nation's flag is now: " + my.selectedFlag);
				document.getElementById('selectedFlag').textContent = my.selectedFlag;
				$("[title]").tooltip('fixTitle');
			}).fail(function(e){
				// not enough money
				Msg(e.statusText);
			}).always(function(){
				g.unlock();
			});
		});
		$("#titleViewBackdrop").on('click', function(){
			title.hideBackdrop();
		});
		$("#configureNationDone, #leaderboardDone").on('click', function(){
			audio.play('click');
			title.hideBackdrop();
		});
		$("#autoJoinGame").on('click', function(){
			audio.play('click');
			$("#joinGamePassword").val();
			$(".wars").filter(":first").trigger("click"); 
			if (!$("#joinGameName").val()){
				Msg("No unranked games found!", 1.5);
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
		});
	})(),
	map: (function(){
		if (!isFirefox){
			$("body").on("mousewheel", function(e){
				if (g.view !== 'title'){
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
				if (g.view !== 'title'){
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
			}
		});
		$("#diplomacy-ui").on('click', '#surrender', function(e){
			surrenderMenu(); 
		});
		$("#createGameWrap").on('click', '.mapSelect', function(e){
			var x = $(this).text();
			var key = x.replace(/ /g,'');
			g.map.name = x;
			g.map.key = key;
			document.getElementById('createGameMap').innerHTML = x;
			document.getElementById('createGameTiles').innerHTML = title.mapData[key].tiles;
			document.getElementById('createGamePlayers').innerHTML = title.mapData[key].players;
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.gameSelect', function(e){
			e.preventDefault();
		});
		$("#mainWrap").on('click', '.speedSelect', function(e){
			var x = $(this).text();
			g.speed = g.speeds[x];
			console.info(x, g.speed);
			$("#createGameSpeed").text(x);
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
}