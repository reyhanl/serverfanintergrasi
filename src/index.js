require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const admin = require('firebase-admin');
const dotenv = require('dotenv');

/**
 * Module dependencies.
 */

const app = require('./app');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

const firebaseAdminPrivateKey = process.env.private_key.replace(/\\n/g, '\n');

// Construct the serviceAccount object using environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: firebaseAdminPrivateKey,
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

app.get('/fetchUsers', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    }));
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('App started. Listening on ' + bind);
}
