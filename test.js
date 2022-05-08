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

async function run(i) {
	my_query = await pool.query(`SELECT * FROM chat_user`)
	console.log(my_query.rows[0].id + " " + i);
}

async function helper() {
	for (i = 0; i < 100; i++)
		await run(i);
}

helper();