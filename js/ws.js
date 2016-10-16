var ws = {
	init: (function retry(count){
		if (count <= 10){
			conn = new WebSocket('ws://localhost:8080');
		} else {
			console.error("Attempted to connect to the websocket server 10 times and failed.");
		}
		conn.onopen = function(e) {
			console.warn("Websocket Connection established!");
		};

		conn.onmessage = function(e) {
			console.log("DATA RECEIVED: ", e.data);
		};
		
		conn.onerror = function(){
			console.info("Attempt: " + count)
			console.error("Failed to connect via websockets. Trying again in 10 seconds. ");
			retry(++count);
		}
	})(1)
}