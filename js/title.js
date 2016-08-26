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
		$("#titleChatSend").on('click', function(){
			title.sendMsg(true);
		});
		(function repeat(){
			if (g.view === 'title'){
				$.ajax({
					type: "GET",
					url: "php/titleUpdate.php"
				}).done(function(data){
					// report chat messages
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
					}, 1500);
				});
			}
		})();
		setTimeout(function(){
			title.chat("Welcome to the global chat lobby.", "chat-warning");
		}, 100);
	})(),
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
$(".titleButtons").on("click", function(){
	$(".titleButtons").removeClass("active");
	$(this).addClass("active");
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
	var x = 
	"<div class='container w100'>\
		<div class='row'>\
			<label class='col-xs-12 control-label'>Game Name</label>\
		</div>\
		<div class='row'>\
			<div class='col-xs-12'>\
				<input id='gameName' class='form-control' type='text' maxlength='32' autocomplete='off'>\
			</div>\
		</div>\
		<div class='row buffer2'>\
			<label class='col-xs-12 control-label'>Password (Optional)</label>\
		</div>\
		<div class='row'>\
			<div class='col-xs-12'>\
				<input id='gamePassword' class='form-control' type='text' maxlength='32' autocomplete='off'>\
			</div>\
		</div>\
		<div class='row buffer2'>\
			<label class='col-xs-12 control-label'>Maximum Players</label>\
		</div>\
		<div class='row'>\
			<div class='col-xs-3'>\
				<input id='gamePlayers' type='number' class='form-control' id='gamePlayers' value='8' min='2' max='8'>\
			</div>\
		</div>\
		<div class='row buffer2'>\
			<label class='col-xs-12 control-label'>Map</label>\
		</div>\
		<div class='row'>\
			<div class='col-xs-12'>\
				<div class='dropdown'>\
					<button class='btn btn-primary dropdown-toggle shadow4' type='button' data-toggle='dropdown'>\
						<span id='createGameMap'>Earth Alpha</span>\
						<span class='caret'></span>\
					</button>\
					<ul id='mapDropdown' class='dropdown-menu'>\
						<li><a class='mapSelect' href='#'>Earth Alpha</a></li>\
					</ul>\
				</div>\
			</div>\
		</div>\
		<div class='row buffer2'>\
			<div class='col-xs-12'>\
				<label class='control-label'>Map Description</label>\
				<div>\
					<span id='createGameDescription'>Up to 8 players vie for domination in this sprawling map across six continents.</span>\
					<span id='createGameGlobe' data-toggle='tooltip' title='Number of territories for this map'><i class='fa fa-globe'></i> <span id='createGameTiles'>83</span></span>\
				</div>\
			</div>\
		</div>\
		<div class='row'>\
			<hr class='fancyhr'>\
		</div>\
		<div class='row'>\
			<div class='col-xs-12 text-center'>\
				<button id='createGame' type='button' class='btn btn-md btn-info btn-responsive shadow4'>Create Game Lobby</button>\
			</div>\
		</div>\
	</div>";
	$("#createGameWrap").html(x);
	$("#createGameGlobe").tooltip();
	document.getElementById('refreshGameWrap').style.display = 'none';
	document.getElementById('createGameWrap').style.display = 'block';
	$("#gameName").focus();
});

$("#menu").on("mousedown", "#createGame", function(e){
	var name = $("#gameName").val();
	var pw = $("#gamePassword").val();
	var players = $("#gamePlayers").val()*1;
	if (name.length < 1 || name.length > 32){
		Msg("Game name must be at least 4-32 characters.");
	} else if (players < 2 || players > 8 || players % 1 !== 0){
		Msg("Game must have 2-8 players.");
	} else {
		g.lock(1);
		audio.play('click');
		$.ajax({
			url: 'php/createGame.php',
			data: {
				name: name,
				pw: pw,
				players: players,
				map: my.map
			}
		}).done(function(data) {
			my.player = data.player;
			console.info("Creating: ", data);
			lobby.init(data);
			lobby.join(); // create
		}).fail(function(e){
			console.info(e.responseText);
			g.unlock(1);
		});
	}
});

function joinGame(){
	if (!g.id || typeof g.id !== 'number'){
		return;
	}
	var pw = $("#joinGamePassword").val();
	g.lock();
	audio.play('click');
	$.ajax({
		url: 'php/joinGame.php',
		data: {
			gameId: g.id,
			pw: pw
		}
	}).done(function(data) {
		console.info(data);
		my.player = data.player;
		lobby.init(data);
		lobby.join(); // normal join
	}).fail(function(data){
		console.info(data);
		Msg(data.statusText);
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
	}, .025);
}
$("#toggleNation").on("click", function(){
	var e = document.getElementById("configureNation"),
		e2 = document.getElementById("configureNationBackdrop");
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
	animateNationName();
});

$("#flagDropdown").on('click', '.flagSelect', function(){
	my.selectedFlag = $(this).text();
	my.selectedFlagFull = my.selectedFlag === "Nepal" ? my.selectedFlag+".png" : my.selectedFlag+".jpg";
	$(".flagPurchaseStatus").css("display", "none");
	$("#updateNationFlag")
		.attr("src", "images/flags/" + my.selectedFlagFull)
		.css("display", "block");
	console.info(my.selectedFlag, my.selectedFlagFull);
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

$("#submitNationName").on("mousedown", function(e){
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
		Msg("Your nation shall now be known as: " + data);
		animateNationName();
	}).fail(function(e){
		Msg(e.statusText);
	}).always(function(){
		g.unlock();
	});
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
$("#configureNationDone, #configureNationBackdrop").on('click', function(){
	var e = document.getElementById("configureNation"),
		e2 = document.getElementById("configureNationBackdrop");
	e.style.visibility = "hidden";
	e2.style.visibility = "hidden";
	
});