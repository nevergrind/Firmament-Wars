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

		$("#create").on("click", function(){
			$("#gameName").val('');
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
					$("#gameName").focus();
				}
			});
			g.isModalOpen = true;
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
		$("#configureNationDone").on('click', function(){
			audio.play('click');
			title.hideBackdrop();
		});
		$("#rankedMatch").on('click', function(){
			var max = $("#createGameMaxPlayerWrap");
			var pw = $("#createGamePasswordWrap");
			var css = max.css('display') === 'block' ?
				'none' : 'block';
			max.css('display', css);
			var css = pw.css('display') === 'block' ?
				'none' : 'block';
			pw.css('display', css);
		});
		$("#joinRankedGame").on('click', function(){
			audio.play('click');
			g.lock();
			(function repeat(count){
				if (count < 6 && !g.joinedGame){
					Msg("Searching for ranked games...", 0);
					setTimeout(repeat, 5000, ++count);
					// ajax call to join ranked game
					$.ajax({
						url: 'php/joinRankedGame.php'
					}).done(function(data){
						TweenMax.set(DOM.Msg, {
							opacity: 0
						});
						g.joinedGame = 1;
						g.unlock();
						title.joinGameCallback(data);
					}).fail(function(data){
						console.info(data);
					});
				} else {
					if (!g.joinedGame){
						Msg("No ranked games found! Try creating a ranked game instead.", 5);
						g.unlock();
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