// title.js
var title = {
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
							for (var i=0; i<len; i++){
								if (data.chat[i]){
									title.chat(data.chat[i]);
								}
							}
						}
					}).always(function(){
						setTimeout(function(){
							repeat();
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
			document.getElementById('mapDropdown').innerHTML = str;
		}, 100);
	})(),
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
			e3 = document.getElementById('createGameWrap');
		TweenMax.to([e,e2,e3], .2, {
			alpha: 0,
			ease: Linear.easeNone,
			onComplete: function(){
				e.style.visibility = "hidden";
				e2.style.visibility = "hidden";
				e3.style.visibility = 'hidden';
			}
		});
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

$("#menu").on("click", ".wars", function(){
	$(".wars").removeClass("selected");
	$(this).addClass("selected");
	g.id = $(this).data("id");
	
});
// initializes refresh games
$("#refreshGames").on("click", function(){
	refreshGames();
}).trigger("click");

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
});

$("#createGame").on("mousedown", function(e){
	title.createGame();
});

function joinGame(){
	var name = $("#joinGameName").val();
	if (!g.id && !name){
		Msg("Invalid game data.", 1.5);
		return;
	}
	var pw = $("#joinGamePassword").val();
	g.lock();
	audio.play('click');
	$.ajax({
		url: 'php/joinGame.php',
		data: {
			gameId: g.id,
			name: name,
			pw: pw
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
}

// cached values on client to reduce DB load

$("#menu").on("click", "#joinGame", function(){
	console.info("JOINING: "+g.id);
	joinGame();
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
});

$("#flagDropdown").on('click', '.flagSelect', function(){
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
		$("#nationFlag").attr("src", "images/flags/" + my.selectedFlagFull);
		$("#flagPurchased").css("display", "block");
		Msg("Your nation's flag is now: " + my.selectedFlag);
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
		$("#nationFlag").attr("src", "images/flags/" + my.selectedFlagFull);
		Msg("Your nation's flag is now: " + my.selectedFlag);
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