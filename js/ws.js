// client-side web sockets
var ws = {
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
		push = new ab.Session('wss://localhost/wss2/', function(){
            push.subscribe('titleChat', function(topic, data) {
                // do stuff
                console.warn('New article published to category: ' + topic);
				console.info(data);
            });
        }, function(){
            console.warn('WebSocket connection closed');
        }, {
			'skipSubprotocolCheck': true
		});
	})()
}