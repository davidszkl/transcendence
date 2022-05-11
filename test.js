const { Pool } = require('pg');
const credentials = {
	user: "postgres",
	host: "localhost",
	database: "chat",
	password: "",
	port: 5432,
	max: 1000
  };
const pool = new Pool(credentials);
pool.connect();

async function get_time() {
	tmp = await pool.query(`SELECT timestamp FROM message WHERE id=2`);
	psql = tmp.rows[0].timestamp;
	date = new Date();
	date.setDate(date.getDate() - 1);
	console.log("DATE = " + date);
	tmp = await pool.query(`SELECT id, timestamp FROM message WHERE timestamp > to_timestamp(${date.getTime() / 1000})`);
	for (i = 0; i < tmp.rowCount; i++)
		console.log(tmp.rows[i]);
	// tmp = await pool.query(`SELECT to_timestamp(${date.getDate() / 1000})`);
	// console.log(tmp.rows[0]);
	// tmp = await pool.query(`SELECT to_timestamp(${date.getHours() / 1000})`);
	// console.log(tmp.rows[0]);
	//await pool.query(`INSERT INTO message (user_id, timestamp, message, room_id) VALUES(1, to_timestamp(${date} / 1000), 'ERASE', 14)`);
}

get_time();