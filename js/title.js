// title.js
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
$(".btn-head").on("click", function(){
	$(".btn-head").removeClass("active");
	$(this).addClass("active");
});
var gameId = 0;

$("#menu").on("click", ".wars", function(){
	$(".wars").removeClass("selected");
	$(this).addClass("selected");
	gameId = $(this).data("id");
	
});

$("#refreshGames").on("click", function(){
	refreshGames();
}).trigger("click");

$("#create").on("click", function(){
	var x = 
	"<div id='createGameWrap'>\
		<form class='form-horizontal'>\
			<div class='form-group'>\
				<label id='gameNameLabel' for='gameName' class='col-xs-3 control-label'>Game Name:</label>\
				<div class='col-xs-9'>\
					<input id='gameName' class='form-control' type='text' maxlength='32' autocomplete='off' size='20'>\
				</div>\
			</div>\
			<div class='form-group'>\
				<label id='gamePlayersLabel' for='gamePlayers' class='col-xs-8 control-label'>Maximum Number of Players:</label>\
				<div class='col-xs-4'>\
					<input type='number' class='form-control' id='gamePlayers' value='8' min='2' max='8'>\
				</div>\
			</div>\
			<div class='form-group '>\
				<div class='col-xs-12'>\
					<button id='createGame' type='button' class='btn btn-md btn-info btn-responsive pull-right shadow4'>Create Game Lobby</button>\
				</div>\
			</div>\
		</form>\
	</div>";
	$("#menuContent").html(x);
	$("#gameName").focus();
});

$("#menu").on("mousedown", "#createGame", function(e){
	var name = $("#gameName").val();
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
				players: players
			}
		}).done(function(data) {
			console.info("Creating: ", data);
			joinLobby(); // create
		}).fail(function(e){
			console.info(e.responseText);
			Msg(e.statusText);
			g.unlock(1);
		});
	}
});

function joinGame(){
	g.lock();
	audio.play('click');
	$.ajax({
		url: 'php/joinGame.php',
		data: {
			gameId: gameId
		}
	}).done(function(data) {
		joinLobby(); // normal join
	}).fail(function(e){
		Msg(e.statusText);
	}).always(function(){
		g.unlock();
	});
}

// cached values on client to reduce DB load

$("#menu").on("click", "#joinGame", function(){
	console.info("JOINING: "+gameId);
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
	var e = document.getElementById("configureNation");
	var s = e.style.visibility;
	e.style.visibility = s === "hidden" || !s ? "visible" : "hidden";
	TweenMax.fromTo("#configureNation", .5, {
		scale: .8,
		alpha: 0
	}, {
		scale: 1,
		z: 0,
		alpha: 1
	});
	
	animateNationName();
});

$("#flagDropdown").on("change", function(e){
	$(".flagPurchaseStatus").css("display", "none");
	var z = $(this).val();
	var x = z === "Nepal" ? "Nepal.png" : z + ".jpg";
	$("#updateNationFlag").attr("src", "images/flags/" + x)
		.css("display", "block");
	g.lock(1);
	$.ajax({
		url: 'php/updateFlag.php',
		data: {
			flag: x
		}
	}).done(function(data) {
		$("#offerFlag").css("display", "none");
		$("#nationFlag").attr("src", "images/flags/" + x);
		$("#flagPurchased").css("display", "block");
		Msg("Your nation's flag is now: " + z);
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
	var e = $("#flagDropdown").val();
	var x = e === "Nepal" ? "Nepal.png" : e + ".jpg";
	g.lock();
	$.ajax({
		url: 'php/buyFlag.php',
		data: {
			flag: x
		}
	}).done(function(data) {
		$("#crystalCount").text(data);
		$("#flagPurchased").css("display", "block");
		$("#offerFlag").css("display", "none");
		$("#nationFlag").attr("src", "images/flags/" + x);
		Msg("Your nation's flag is now: " + e);
	}).fail(function(e){
		// not enough money
		Msg(e.statusText);
	}).always(function(){
		g.unlock();
	});
});

$("#Msg").on("click", ".msg", function(){
	var e = this;
	TweenMax.killTweensOf(e);
	e.parentNode.removeChild(e);
});