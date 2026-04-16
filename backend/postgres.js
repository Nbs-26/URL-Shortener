const { Client } = require('pg');
require('dotenv').config();

async function createPostgresClient() {
  const client = new Client({
    host: process.env.host,
    port: process.env.port,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    return client;
  } catch (err) {
    console.error('Postgres Connection error', err);
    throw err;
  }
}

module.exports = {createPostgresClient}