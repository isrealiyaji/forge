const { Pool } = require("pg");
const config = require("../config/index.js");

const pool = new Pool({ connectionString: config.databaseUrl });

module.exports = pool;
