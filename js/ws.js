// client-side web sockets
var socket = {
	init: (function retry(count){
		return;
		if (count <= 10){
			// conn = new WebSocket('wss://localhost/wss2/');
		} else {
			console.error("Attempted to connect to the websocket server 10 times and failed.");
		}
		conn.onopen = function(e) {
			console.clear();
			console.info("Websocket Connection established!");
		};

		conn.onmessage = function(e) {
			console.info("DATA RECEIVED: ", e.data);
		};
		
		conn.onerror = function(){
			console.error("Failed to connect via websockets. Trying again in 1 second. ");
			setTimeout(function(){
				retry(++count);
			}, 1000);
		}
	})(1),
	initPush: (function(){
		zmq = new ab.Session('wss://' + location.hostname + '/wss2/', function(){
            zmq.subscribe('title:Global', function(topic, data) {
                // do stuff
				console.info(data);
				var type = data.type;
				if (type === 'chat'){
					// process chat messages from title screen
					// report chat messages
					/*
					var len = data.chat.length;
					if (len > 0){
						// get chat messages
						for (var i=0; i<len; i++){
							if (data.chat[i]){
								title.chat(data.chat[i]);
							}
						}
					}
					*/
					title.chat(data.message);
					/*
					// set title players
					if (data.playerData !== undefined){
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
								e.innerHTML = '<img id="titlePlayerFlag_' + account + '" class="inlineFlag" src="images/flags/' + flag +'"> ' + account;
								if (title.titleUpdate){
									DOM.titleChatPlayers.appendChild(e);
								}
							} else if (title.players[account].flag !== flag){
								// replace player flag
								var flagElement = document.getElementById("titlePlayerFlag_" + account);
								if (flagElement !== null){
									flagElement.src = 'images/flags/' + flag;
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
					*/
				}
            });
        }, function(){
            console.warn('WebSocket connection closed');
        }, {
			'skipSubprotocolCheck': true
		});
	})()
}