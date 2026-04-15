const { Client } = require('pg');
const envPath = require('./.env');
require('dotenv').config({path:envPath});

const client = new Client({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});

async function createPostgresClient() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    return client;
  } catch (err) {
    console.error('Postgres Connection error', err);
  } finally {
    await client.end();
  }
}

module.exports = {createPostgresClient}