// title.js
var title = {
	players: [],
	init: (function(){
		console.info("Initializing title screen...");
		// prevents auto scroll while scrolling
		$("#titleChatLog").on('mousedown', function(){
			title.chatDrag = true;
		}).on('mouseup', function(){
			title.chatDrag = false;
		});
		$("#title-chat-input").on('focus', function(){
			title.chatOn = true;
		}).on('blur', function(){
			title.chatOn = false;
		});
		$(".createGameInput").on('focus', function(){
			title.createGameFocus = true;
		}).on('blur', function(){
			title.createGameFocus = false;
		});
		$("#titleChatSend").on('click', function(){
			title.sendMsg(true);
		});
		$.ajax({
			type: 'GET',
			url: 'php/initChatId.php'
		}).done(function(data){
			title.titleUpdate = $("#titleChatPlayers").length;
			if (!title.titleUpdate){
				$("#titleChat, #titleMenu").remove();
			}
			(function repeat(){
				if (g.view === 'title'){
					var start = Date.now();
					$.ajax({
						type: "GET",
						url: "php/titleUpdate.php"
					}).done(function(data){
						// report chat messages
						console.log("Ping: ", Date.now() - start);
						var len = data.chat.length;
						if (len > 0){
							// get chat messages
							for (var i=0; i<len; i++){
								if (data.chat[i]){
									title.chat(data.chat[i]);
								}
							}
						}
						// set title players
						if (data.playerData !== undefined){
							// console.warn(data.playerData);
							var p = data.playerData,
								foundPlayers = [];
							for (var i=0, len=p.length; i<len; i++){
								// add new players
								var account = p[i].account,
									flag = p[i].flag;
								if (title.players[account] === undefined){
									// console.info("ADDING PLAYER: " + account);
									title.players[account] = {
										flag: flag
									}
									var e = document.createElement('div');
									e.className = "titlePlayer";
									e.id = "titlePlayer" + account;
									var flagName = flag.split(".");
									e.innerHTML = '<img class="inlineFlag" src="images/flags/' + flag +'"> ' + account;
									if (title.titleUpdate){
										DOM.titleChatPlayers.appendChild(e);
									}
								}
								foundPlayers.push(account);
							}
							// remove missing players
							for (var key in title.players){
								if (foundPlayers.indexOf(key) === -1){
									// console.info("REMOVING PLAYER: " + key);
									delete title.players[key];
									var z = document.getElementById('titlePlayer' + key);
									z.parentNode.removeChild(z);
								}
							}
						}
					}).always(function(){
						setTimeout(function(){
							if (title.titleUpdate){
								repeat();
							}
						}, 1000);
					});
				}
			})();
		});
		setTimeout(function(){
			title.chat("You have joined the global chat lobby.", "chat-warning");
			var str = '';
			for (var key in title.mapData){
				str += "<li><a class='mapSelect' href='#'>" + title.mapData[key].name + "</a></li>";
			}
			var e1 = document.getElementById('mapDropdown');
			if (e1 !== null){
				e1.innerHTML = str;
			}
			$('[title]').tooltip();
			title.animateLogo();
		}, 100);
		var interval = location.host === 'localhost' ? 1000 : 12000;
		(function repeat(){
			if (g.view === 'title'){
				setTimeout(function(){
					if (title.titleUpdate){
						refreshGames();
						repeat();
					}
				}, interval);
			}
		})();
		refreshGames(true);
	})(),
	animateLogo: function(){
		var globeDelay = 1,
			globeYoyo = 6;
		// animate stars
		TweenMax.to('#firmamentWarsStars1', 120, {
			backgroundPosition: '-800px 0px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars2', 80, {
			startAt: {
				backgroundPosition: '250px 250px', 
			},
			backgroundPosition: '-1050px 250px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars3', 40, {
			startAt: {
				backgroundPosition: '600px 500px', 
			},
			backgroundPosition: '-200px 500px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		TweenMax.to('#firmamentWarsStars4', 20, {
			startAt: {
				backgroundPosition: '400px 600px', 
			},
			backgroundPosition: '-400px 600px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		// logo
		TweenMax.to('#firmamentWarsLogo', globeDelay, {
			startAt: {
				visibility: 'visible',
				scale: 0,
				alpha: 0
			},
			alpha: 1,
			scale: 1,
			ease: Quad.easeIn
		});
		TweenMax.to('#firmamentWarsBlur', globeDelay, {
			startAt: {
				visibility: 'visible',
				scaleX: 0,
				alpha: 1
			},
			scaleX: 1,
			alpha: 1,
			ease: Quad.easeIn
		});
		TweenMax.to('#firmamentWarsLogo, #firmamentWarsBlur', globeDelay, {
			startAt: {
				yPercent: -50
			},
			top: '50%',
			onComplete: function(){
				TweenMax.to('#firmamentWarsBlur', 4, {
					startAt: {
						transformOrigin: '50% 50%',
						scaleX: 1,
						scaleY: 1
					},
					ease: Linear.easeNone,
					scaleX: 1.2,
					scaleY: 1.1,
					repeat: -1,
					yoyo: true
				});
				TweenMax.to('#firmamentWarsBlur', 1.666, {
					startAt: {
						transformOrigin: '50% 50%',
						skewX: 0,
					},
					ease: Linear.easeNone,
					skewX: 5,
					repeat: -1,
					yoyo: true
				});
				TweenMax.to('#titleMain', .5, {
					startAt: {
						visibility: 'visible'
					},
					opacity: 1
				});
			}
		});
		// globe
		TweenMax.to('#titleGlobe', globeDelay, {
			bottom: '0%'
		});
	},
	mapData: {
		EarthAlpha: {
			name: 'Earth Alpha',
			tiles: 83,
			players: 8
		},
		FlatEarth: {
			name: 'Flat Earth',
			tiles: 78,
			players: 8
		}
	},
	chatDrag: false,
	chatOn: false,
	chat: function (msg, type){
		while (DOM.titleChatLog.childNodes.length > 500) {
			DOM.titleChatLog.removeChild(DOM.titleChatLog.firstChild);
		}
		var z = document.createElement('div');
		if (type){
			z.className = type;
		}
		z.innerHTML = msg;
		DOM.titleChatLog.appendChild(z);
		if (!title.chatDrag){
			DOM.titleChatLog.scrollTop = DOM.titleChatLog.scrollHeight;
		}
		console.info("MSG: ", msg);
		if (!document.hasFocus()){
			// it's a player message
			if (msg.indexOf("images/flags") > -1){
				var flagArr = msg.split('"'),
					flagPath = flagArr[1],
					bodyArr = msg.split(':'),
					body = bodyArr[1],
					msgArr = bodyArr[0].split('>'),
					msg = msgArr[1] + ' says:';
				Notification.requestPermission(function(){
					new Notification(msg, {
						icon: flagPath,
						tag: "Nevergrind",
						body: body
					});
				});
			}
		}
	}, 
	sendMsg: function(bypass){
		var message = $DOM.titleChatInput.val();
		if (bypass || title.chatOn){
			// bypass via ENTER or chat has focus
			if (message){
				// send ajax chat msg
				$.ajax({
					url: 'php/insertTitleChat.php',
					data: {
						message: message
					}
				});
			}
			$DOM.titleChatInput.val('');
		}
	},
	hideBackdrop: function(){
		var e = document.getElementById("configureNation"),
			e2 = document.getElementById("titleViewBackdrop"),
			e3 = document.getElementById('createGameWrap')
			e4 = document.getElementById('optionsModal');
		TweenMax.to([e,e2,e3,e4], .2, {
			alpha: 0,
			ease: Linear.easeNone,
			onComplete: function(){
				console.info(this.target.id);
				TweenMax.set(this.target, {
					visibility: 'hidden'
				});
			}
		});
		g.isModalOpen = false;
	},
	createGameFocus: false,
	createGame: function(){
		var name = $("#gameName").val(),
			pw = $("#gamePassword").val(),
			players = $("#gamePlayers").val()*1;
		if (name.length < 1 || name.length > 32){
			Msg("Game name must be at least 4-32 characters.");
		} else if (players < 2 || players > 8 || players % 1 !== 0){
			Msg("Game must have 2-8 players.");
		} else {
			title.hideBackdrop();
			g.lock(1);
			audio.play('click');
			$.ajax({
				url: 'php/createGame.php',
				data: {
					name: name,
					pw: pw,
					players: players,
					map: title.mapData[g.map.key].name
				}
			}).done(function(data) {
				my.player = data.player;
				console.info("Creating: ", data);
				lobby.init(data);
				lobby.join(); // create
			}).fail(function(e){
				console.info(e.responseText);
				Msg(e.statusText);
				g.unlock(1);
			});
		}
	},
	joinGame: function(){
		g.name = $("#joinGameName").val();
		if (!g.name){
			Msg("Game name is not valid!", 1.5);
			return;
		}
		g.password = $("#joinGamePassword").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/joinGame.php',
			data: {
				name: g.name,
				password: g.password
			}
		}).done(function(data) {
			console.info(data);
			my.player = data.player;
			g.map = data.mapData;
			lobby.init(data);
			lobby.join(); // normal join
		}).fail(function(data){
			console.info(data);
			Msg(data.statusText, 1.5);
		}).always(function(){
			g.unlock();
		});
	},
	submitNationName: function(){
		var x = $("#updateNationName").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: 'php/updateNationName.php',
			data: {
				name: x
			}
		}).done(function(data) {
			$("#nationName").text(data);
			animateNationName();
		}).fail(function(e){
			Msg(e.statusText);
		}).always(function(){
			g.unlock();
		});
	}
}
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
$("#gameView").on('dragstart', 'img', function(e) {
	e.preventDefault();
});
$("img").on('dragstart', function(event) {
	event.preventDefault();
});

$("#logout").on('click', function() {
	playerLogout();
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

function animateNationName(){
	var tl = new TimelineMax();
	var split = new SplitText("#nationName", {
		type: "words,chars"
	});
	var chars = split.chars;
	tl.staggerFromTo(chars, .05, {
		immediateRender: true,
		alpha: 0
	}, {
		delay: .25,
		alpha: 1
	}, .016);
}
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
		$(".nationFlag").attr("src", "images/flags/" + my.selectedFlagFull);
		$("#flagPurchased").css("display", "block");
		Msg("Your nation's flag is now: " + my.selectedFlag);
		document.getElementById('selectedFlag').textContent = my.selectedFlag;
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
$("#menuContent").on("focus", "#gameName", function(){
	g.focusGameName = true;
})
$("#menuContent").on("blur", "#gameName", function(){
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
		$(".nationFlag").attr("src", "images/flags/" + my.selectedFlagFull);
		Msg("Your nation's flag is now: " + my.selectedFlag);
		document.getElementById('selectedFlag').textContent = my.selectedFlag;
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