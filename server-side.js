const { query } = require("express");
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
	res.sendFile("/Users/davidszklarzewski/Desktop/typescript/index.html");
});
 
app.post("/select", async (req, res) => {
	console.log(req.body.value);
	me.selected_room = req.body.value;
	console.log('selected ' + me.selected_room);
	await refresh(me);
	me.show();
	res.status(200).send();
})

app.post("/block", async (req, res) => {
	await block(me, req.body.value);
	console.log('blocked ' + req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/unblock", async (req, res) => {
	await unblock(me, req.body.value);
	console.log('unblocked ' + req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/message", async (req, res) => {
	await send_dm(me, req.body.value);
	console.log("new message= " + req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/test", async (req, res) => {
	console.log(req.body.value);
	await test();
	console.log('test done');
})

app.listen(port, () => {
	console.log("listening on port 3000");
});

//POSTGRES
const pg = require('pg');
const { Pool } = require('pg')

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "chat",
  password: "",
  port: 5432,
  max: 1000
};

const pool = new Pool(credentials);
pool.on('error', (err, client) => {
    console.error('Error:', err);
});
pool.connect();

//SESSION
class Session {
	constructor() {
		this.id = 1;
		this.username = "dszklarz";
		this.conversations = [];
		this.blocked = [];
		this.selected_room = 0;
		this.messages = [];
	}
	show() {
		console.log("CONVERSATIONS======");
		console.log(this.conversations);
		console.log("BLOCKED============");
		console.log(this.blocked);
		console.log("MESSAGES===========");
		console.log(this.messages);
		console.log("SELECTED===========");
		console.log(this.selected_room);
		console.log("END================");
	}
}

class Conversation {
	constructor() {
		this.id = 0;
		this.name = "";
		this.participants = [];
	}
}

const me = new Session();

//FUNCTIONS

async function test() {
	my_query = await pool.query(`SELECT id, name FROM chat_user`);
	for (i = 0; i < my_query.rowCount; i++)
	{
		console.log(my_query.rows[i].id);
		console.log(my_query.rows[i].name);	
	}
}

async function get_convs(me) {
	my_query = await pool.query(`SELECT id, name, owner FROM room WHERE id in (SELECT room_id FROM participants WHERE user_id = ${me.id}) ORDER BY activity DESC`);
	me.conversations = [];
	for (i = 0; i < my_query.rowCount; i++)
	{
		my_query2 = await pool.query(`SELECT user_id FROM participants WHERE room_id = ${my_query.rows[i].id} and not user_id= ${me.id}`);
		if (my_query2.rowCount == 0 || ( !(my_query.rows[i].owner) && me.blocked.includes(my_query2.rows[0].user_id)))
			continue;
		tmp = new Conversation();
		tmp.id	 = my_query.rows[i].id;
		tmp.name = my_query.rows[i].name;
		for (n = 0; n < my_query2.rowCount; n++)
			tmp.participants.push(my_query2.rows[n]["user_id"]);
		//console.log('participants in room ' + my_query.rows[i]["id"] + " " + tmp.participants);
		me.conversations.push(tmp);
	}
}

async function get_blocked(me) {
	my_query = await pool.query(`SELECT blocked_id FROM blocked WHERE user_id=${me.id} UNION SELECT user_id FROM blocked WHERE blocked_id=${me.id}`);
	me.blocked = [];
	for (i = 0; i < my_query.rowCount; i++)
		me.blocked.push(my_query.rows[i]["blocked_id"]);
}

async function get_message(me) {
	// console.log(messages);
	// if (messages.length)
	// {
	// 	last_time = messages[messages.length - 1]["timestamp"];
	// 	my_query = await pool.query(`SELECT NOW()`);
	// 	console.log(my_query.rows[0]);
	// 	my_query = await pool.query(`SELECT message, timestamp FROM message WHERE room_id = ${selected_room} AND timestamp > to_timestamp(${last_time}) ORDER BY timestamp DESC`);
	// }
	// else
	my_query = await pool.query(`SELECT user_id, id, message, hidden, timestamp FROM message WHERE room_id = ${me.selected_room} ORDER BY timestamp DESC`);
	me.messages = [];
	for (i = 0; i < my_query.rowCount; i++)
		if (!me.blocked.includes(my_query.rows[i].id) && !my_query.rows[i].hidden)
			me.messages.push(my_query.rows[i]);
}

async function on_connect(me) {
	my_query = await pool.query(`SELECT id from chat_user WHERE name='${me.username}'`);
	if (my_query.rowCount === 1)
		me.id = my_query.rows[0]["id"];
	pool.query(`UPDATE chat_user SET status=true WHERE id=${me.id}`);
	await get_blocked(me);
	await get_convs(me);
	if (me.conversations.length)
		me.selected_room = me.conversations[0].id;
	await get_message(me);
}

async function refresh(me) {
	await get_blocked(me);
	await get_convs(me);
	await get_message(me);
}

async function on_dm_click(room_id) {
	selected_room = room_id;
	await refresh(me);
}

async function send_dm(me, message) {
	await pool.query(`INSERT INTO message(user_id, timestamp, message, room_id) VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`)
	await get_message(me);
}

async function erase_dm(me, message_id) {
	await pool.query(`DELETE FROM message WHERE id=${message_id}`)
	await get_message(me);
}

async function block(me, block_id) {
	await pool.query(`INSERT INTO blocked(user_id, blocked_id) VALUES(${me.id}, ${block_id})`);
	await refresh(me);
	me.selected_room = me.conversations.length ? me.conversations[0].id : 0;
	await refresh(me);
}

async function unblock(me, block_id) {
	await pool.query(`DELETE FROM blocked WHERE blocked_id=${block_id} and user_id=${me.id}`);
	await refresh(me);
}

async function add_friend(me, username) {
	friend_id = await pool.query(`SELECT id FROM chat_user WHERE name= '${username}'`);
	if (!friend_id.rowCount)
		console.log("user not found");

	//AVAILABLE FRIENDS
	// my_query = await pool.query(`select id from chat_user where id not in (select user_id from participants where room_id in (select room_id from participants where user_id =${me.id}AND room_id not in (select id from room where not owner=0))) and not id=${me.id};`);
	// available = [];
	// for (i = 0; i < my_query.rowCount; i++)
	// 	if (!blocked.includes(my_query.rows[0].id))
	// 		available.push(my_query.rows[0].id);
			
	await pool.query(`INSERT INTO room(name) VALUES('${me.username}-${username}');`);
	new_room = await pool.query(`SELECT id from room WHERE name = '${me.username}-${username}'`);
	new_room_id = new_room_id.rows[0].id;
	await pool.query(`INSERT INTO participants (user_id, room_id) VALUES(${me.id}, ${new_room_id})`);
	await pool.query(`INSERT INTO participants (user_id, room_id) VALUES(${friend_id.rows[0].id}, ${new_room_id})`);
	await refresh(me);
}

async function remove_friend(me, username) {
	tmp = await pool.query(`SELECT id FROM chat_user WHERE name='${username}'`);
	friend_id = tmp.rows[0].id;
	friend_room = await pool.query(`SELECT id FROM room WHERE id=(SELECT room_id FROM participants WHERE user_id = ${friend_id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0))`)
	await pool.query(`DELETE FROM message WHERE room_id= ${me.selected_room}`);
	await pool.query(`DELETE FROM participants WHERE room_id = ${me.selected_room}`);
	await pool.query(`DELETE FROM room WHERE id= ${me.selected_room}`);
	await refresh(me);
}
//remove_friend(me, 'mlefevre');