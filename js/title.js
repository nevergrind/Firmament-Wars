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
	"<form class='form-horizontal'>\
		<div class='form-group'>\
			<label class='col-sm-4 control-label'>Game Name:</label>\
			<div class='col-sm-8'>\
				<input id='gameName' class='form-control' type='text' maxlength='32' autocomplete='off'>\
			</div>\
		</div>\
		<div class='form-group'>\
			<label class='col-xs-9 control-label'>Maximum Players:</label>\
			<div class='col-xs-3'>\
				<input id='gamePlayers' type='number' class='form-control' id='gamePlayers' value='8' min='2' max='8'>\
			</div>\
		</div>\
	</form>\
	<div class='container-fixed buffer2'>\
		<div class='row'>\
			<div class='col-xs-4'>\
				<label>Map:</label>\
			</div>\
			<div class='col-xs-8'>\
				<label>Description:</label>\
			</div>\
		</div>\
		<div class='row buffer'>\
			<div class='col-xs-4'>\
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
			<div class='col-xs-8'>\
				<span id='createGameDescription'>Up to 8 players vie for domination in this sprawling map across six continents.</span>\
				<span id='createGameGlobe' data-toggle='tooltip' title='Number of territories for this map'><i class='fa fa-globe'></i> <span id='createGameTiles'>83</span></span>\
			</div>\
		</div>\
		<div class='row'>\
			<hr class='col-xs-12 fancyhr'>\
		</div>\
		<div class='row'>\
			<div class='col-xs-12 text-center'>\
				<button id='createGame' type='button' class='btn btn-md btn-info btn-responsive shadow4'>Create Game Lobby</button>\
			</div>\
		</div>\
	</label>";
	$("#menuContent").html(x);
	$("#gameName").focus();
	$("#createGameGlobe").tooltip();
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
				players: players,
				map: my.map
			}
		}).done(function(data) {
			console.info("Creating: ", data);
			initLobby(data);
			joinLobby(); // create
		}).fail(function(e){
			console.info(e.responseText);
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
		initLobby(data);
		joinLobby(); // normal join
	}).fail(function(e){
		console.info(e.responseText);
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

$("#Msg").on("click", ".msg", function(){
	var e = this;
	TweenMax.killTweensOf(e);
	e.parentNode.removeChild(e);
});