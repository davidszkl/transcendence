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

function add_friend(str) {
	var number = {
		value: str
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/add_friend', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}

function rm_friend(str) {
	var number = {
		value: str
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/rm_friend', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(number));
}

function create_group() {
	form = document.getElementById('1');
	var obj = {
		name: form.name.value,
		private: form.priv.value,
		password: form.pass.value,
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/create_group', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(obj));
}

function add_user_group(id) {
	var obj = {
		value: id
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/add_user_group', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(obj));
}

function mute_user_group(id) {
	var obj = {
		value: id
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/mute_user_group', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(obj));
}

function rm_user_group(id) {
	var obj = {
		value: id
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/rm_user_group', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(obj));
}

function rm_group(id) {
	var obj = {
		value: id
	}
	var xhr = new window.XMLHttpRequest();
	xhr.open('POST', '/rm_group', true);
	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhr.send(JSON.stringify(obj));
}