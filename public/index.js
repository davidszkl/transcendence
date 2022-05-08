function select (nbr) {
	var number = {
	  value: nbr
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/select', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}

function block(nbr) {
	var number = {
		value: nbr
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/block', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}

function unblock(nbr) {
	var number = {
		value: nbr
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/unblock', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}

function send_dm() {
	var msg = {
		value: document.getElementById('message').value
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/message', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(msg));
}

function test() {
	var number = {
		value: 1
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/test', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}