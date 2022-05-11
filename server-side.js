const { query } = require("express");
const express = require("express");
const app = express();
const port = 3000;
const PARTICIPANT = 0;
const ADMIN = 1;
const OWNER = 2;

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
	res.sendFile("/Users/davidszklarzewski/Desktop/Transcendence/index.html");
});

app.post("/select", async (req, res) => {
	console.log(req.body.value);
	await on_select()
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

app.post("/add_friend", async (req, res) => {
	console.log(req.body.value);
	await add_friend(me, req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/rm_friend", async (req, res) => {
	console.log(req.body.value);
	if (typeof req.body.value)
	await rm_friend(me, req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/create_group", async (req, res) => {
	group = new Group(req.body);
	group.owner = me.id;
	group.participants = me.id;
	await create_group(me, req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/add_user_group", async (req, res) => {
	await add_user_group(me.selected_room, req.body.value);
	me.show();
	res.status(200).send();
})

add_user_group(room_id, user_id)
app.post("/rm_group", async (req, res) => {
	console.log(req.body);
	await rm_group(me, req.body.value);
	me.show();
	res.status(200).send();
})

app.post("/test", async (req, res) => {
	console.log(req.body.value);
	await test();
	console.log('test done');
	res.send(me.conversations);
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
		this.status = false;
	}
}

class Group {
	constructor(obj) {
		this.name = obj.name;
		this.owner = obj.owner;
		this.private = obj.private == "on" ? true : false;
		this.password = obj.password;
		this.participants = obj.participants;
	}
}

const me = new Session();

//FUNCTIONS

async function test() {
	my_query = await pool.query(`SELECT status FROM chat_user WHERE id=1`);
	for (i = 0; i < my_query.rowCount; i++)
	{
		console.log(my_query.rows[i].status);
	}
}

async function on_select(me, id) {
	me.selected_room = id;
	me.messages = [];
}

async function get_convs(me) {
	my_query = await pool.query(`SELECT id, name, owner FROM room WHERE id in (SELECT room_id FROM participants WHERE user_id = ${me.id}) ORDER BY activity DESC`);
	me.conversations = [];
	for (i = 0; i < my_query.rowCount; i++) //for every conversation
	{
		my_query2 = await pool.query(`SELECT user_id FROM participants WHERE room_id = ${my_query.rows[i].id} and not user_id= ${me.id}`);
		if (my_query2.rowCount == 0 || ( !(my_query.rows[i].owner) && me.blocked.includes(my_query2.rows[0].user_id)))
			continue;                      //filter conversations with no participants (?) and blocked persons
		my_status = await pool.query(`SELECT status FROM chat_user WHERE id= ${my_query2.rows[0].user_id}`);
		tmp = new Conversation();
		tmp.id		= my_query.rows[i].id;
		tmp.name	= my_query.rows[i].name;
		tmp.status	= my_status.rows[0].status;
		for (n = 0; n < my_query2.rowCount; n++)				//get all participants of a given conversation
			tmp.participants.push(my_query2.rows[n].user_id);
		me.conversations.push(tmp);
		//console.log('participants in room ' + my_query.rows[i]["id"] + " " + tmp.participants);
	}
}

async function get_blocked(me) {
	my_query = await pool.query(`SELECT blocked_id FROM blocked WHERE user_id=${me.id} UNION SELECT user_id FROM blocked WHERE blocked_id=${me.id}`);
	me.blocked = [];
	for (i = 0; i < my_query.rowCount; i++)
		me.blocked.push(my_query.rows[i].blocked_id);
}

async function get_message(me) {
	// console.log(messages);
	if (me.messages.length)
	{
		last_time = new Date(me.messages[me.messages.length - 1].timestamp);
		my_query = await pool.query(`SELECT message, timestamp FROM message WHERE room_id = ${me.selected_room} AND timestamp > to_timestamp(${last_time.getTime() / 1000}) ORDER BY timestamp DESC`);
	}
	else
		my_query = await pool.query(`SELECT user_id, id, message, timestamp FROM message WHERE timestamp > ${last_time} AND room_id = ${me.selected_room} AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id}) ORDER BY timestamp DESC`);
	for (i = 0; i < my_query.rowCount; i++)
		me.messages.push(my_query.rows[i]);
}

async function on_connect(me) {
	my_query = await pool.query(`SELECT id from chat_user WHERE name='${me.username}'`);
	if (my_query.rowCount === 1)
		me.id = my_query.rows[0].id;
	pool.query(`UPDATE chat_user SET status=true WHERE id=${me.id}`);
	await get_blocked(me);
	await get_convs(me);
	if (me.conversations.length)
		me.selected_room = me.conversations[0].id;
	await get_message(me);
}

async function refresh(me) {
	//console.log('blocked');
	await get_blocked(me);
	//console.log('convs');
	await get_convs(me);
	//console.log('message');
	await get_message(me);
}

async function send_dm(me, message) {
	await pool.query(`INSERT INTO message(user_id, timestamp, message, room_id) VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`)
	await get_message(me);
}

async function send_group_msg(me, message) {
	tmp = await pool.query(`SELECT banned_id, unban FROM banned WHERE room_id= ${me.selected_room} AND mute=true AND banned_id=${me.id}`);
	now = await pool.query(`SELECT NOW()`);
	if (tmp.rowCount)
	{
		if (tmp.rows[0].unban < now.rows[0].now)
			await pool.query(`DELETE FROM banned WHERE banned_id=${me.id} AND muted=true`);
		else
			return console.log("you are still muted");
	}
	await pool.query(`INSERT INTO message(user_id, timestamp, message, room_id) VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`);
	await refresh(me);
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

async function available_friends(me) {
	my_query = await pool.query(`select id from chat_user where id not in (select user_id from participants where room_id in (select room_id from participants where user_id =${me.id} AND room_id not in (select id from room where not owner=0))) AND NOT id IN (SELECT blocked_id FROM blocked WHERE user_id=${me.id} ) AND NOT id=${me.id}`);
	available = [];
	for (i = 0; i < my_query.rowCount; i++)
		available.push(my_query.rows[0].id);
	return available;
}

async function add_friend(me, friend_id, username) {

	if (!friend_id)
	{
		tmp = await pool.query(`SELECT id FROM chat_user WHERE name= '${username}'`);
		if (!tmp.rowCount)
			return console.log("user not found");
		friend_id = tmp.rows[0].id;
	}
	if (me.blocked.includes(friend_id))
		return await unblock(me, friend_id);
			
	await pool.query(`INSERT INTO room(name) VALUES('${me.username}-${username}');`);
	new_room	= await pool.query(`SELECT id from room WHERE name = '${me.username}-${username}'`);
	new_room_id	= new_room.rows[0].id;
	await pool.query(`INSERT INTO participants (user_id, room_id) VALUES(${me.id}, ${new_room_id})`);
	await pool.query(`INSERT INTO participants (user_id, room_id) VALUES(${friend_id}, ${new_room_id})`);
	me.selected_room = new_room_id;
	await refresh(me);
}

async function rm_friend(me, friend_id, username) {
	if (!friend_id)
	{
		tmp = await pool.query(`SELECT id FROM chat_user WHERE name='${username}'`);
		if (!tmp.rowCount)
			return console.log('user not found in rm_friend');
		friend_id = tmp.rows[0].id;
	}
	tmp = await pool.query(`SELECT room_id FROM participants WHERE room_id in (SELECT room_id FROM participants WHERE user_id = ${friend_id}) AND user_id =${me.id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0)`)
	friend_room = tmp.rows[0].id;
	if (!friend_room.rowCount)
		return console.log(`no conversation between ${me.id} and ${friend_id} in rm_friend`);
	await pool.query(`DELETE FROM message WHERE room_id= ${friend_room}`);
	await pool.query(`DELETE FROM participants WHERE room_id = ${friend_room}`);
	await pool.query(`DELETE FROM room WHERE id= ${friend_room}`);
	await refresh(me);
}

async function create_group(me, group) {
	try {
		await pool.query(`INSERT INTO room (name, owner, private, password) VALUES('${group.name}', ${me.id}, ${group.private}, crypt('${group.password}', gen_salt('bf')))`);
	}
	catch {
		return console.log('group name already exists');
	}
	tmp = await pool.query(`SELECT id FROM room WHERE name=${group.name}`);
	room_id = tmp.rows[0].id;
	for (i = 0; i < obj.participants.length; i++)
		await pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${obj.participants[i]}, ${room_id})`);
	await refresh(me);
}

async function rm_group(me, room_id) {
	if (await get_role(me.id, room_id) != OWNER)
		return;
	await pool.query(`DELETE FROM message WHERE id=${room_id}`);
	await pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
	await pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
	await pool.query(`DELETE FROM room WHERE id=${room_id}`);
	await refresh(me);
}

async function add_user_group(room_id, user_id) {
	await pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${user_id}, ${room_id})`);
}

//drop-down menu to chose length of ban, either fixed or input but then check for negatives, 0 means just kick from group
async function rm_user_group(me, room_id, user_id, unban_hours) {
	role1 = await get_role(me.id, room_id);
	role2 = await get_role(user_id, room_id);
	if (role1 < ADMIN || role1 <= role2)
		return;
	let unban_date;
	if (unban_hours)
		unban_date = new Date().setHours(unban_date.getHours() + unban_hours);
	else
		unban_date = "NOW()";
	await pool.query(`DELETE FROM participants WHERE user_id=${user_id} AND room_id=${room_id}`);
	await pool.query(`DELETE FROM banned WHERE banned_id=${user_id} AND room_id=${room_id} AND muted=true`);
	await pool.query(`INSERT INTO banned (user_id, banned_id, room_id, unban, mute) VALUES(${me.id}, ${user_id}, ${room_id}, ${unban_date}, false)`)
}

async function add_admin_group(me, room_id, user_id) {
	if (await get_role(me.id, room_id) == OWNER)
		await pool.query(`INSERT INTO admins(user_id, room_id) VALUES(${user_id}, ${room_id})`);
}

async function rm_admin_group(me, room_id, user_id) {
	if (await get_role(me.id, room_id) == OWNER)
		await pool.query(`DELETE FROM admins WHERE user_id=${user_id} AND room_id=${room_id}`);
}

async function mute_user(me, room_id, user_id) {
	role1 = await get_role(me.id, room_id);
	role2 = await get_role(user_id, room_id);
	if (role < ADMIN || role1 <= role2)
		return;
	await pool.query(`INSERT INTO banned (user_id, banned_id, room_id, unban, mute) VALUES(${me.id}, ${user_id}, ${room_id}, ${unban}, true)`)
}

async function unmute_user(me, room_id, user_id) {
	role1 = await get_role(me.id, room_id);
	role2 = await get_role(user_id, room_id);
	if (role < ADMIN || role1 <= role2)
		return;
	await pool.query(`DELETE FROM banned WHERE banned_id= ${user_id} AND room_id= ${room_id}`);
}

async function get_role(id, room_id) {
	tmp = await pool.query(`SELECT owner FROM room WHERE id=${room_id}`);
	if (tmp.rows[0].owner == id)
		return OWNER;
	tmp = await pool.query(`SELECT user_id FROM admins WHERE room_id=${room_id}`);
	if (tmp.rows.includes(id))
		return ADMIN;
	tmp = await pool.query(`SELECT user_id FROM participants WHERE room_id=${room_id}`);
	if (tmp.rows.includes(id))
		return PARTICIPANT;
	return -1;
}

async function join_group(me, name) {
	tmp = await pool.query(`SELECT id, private, password FROM room WHERE name=${name}`);
	room = tmp.rows[0];
	if (room.password.length)
		//provide password and compare SELECT crypt('provided_password', 'bf') with SELECT password FROM room WHERE id=${room.id};
	await pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${me.id}, ${room.id})`);
	me.selected_room = room.id;
}

async function add_conv(me, name)
{
	tmp = await pool.query(`SELECT id, owner FROM room WHERE name=${name}`);
	room = tmp.rows[0];
	if (!room.owner)       // direct message
		await add_friend(me, name);
	else                   // group chat
		await join_group(me, name);
}

on_connect(me);

//TO CHECK WITH THE OTHER DAVID
//1. what to do with private groups
//