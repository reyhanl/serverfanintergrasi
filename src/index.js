const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const admin = require('firebase-admin');
const dotenv = require('dotenv');
// const serviceAccount = require("./firebaseauth.json");
dotenv.config({ path: 'firebase.env' });

const firebaseAdminPrivateKey = process.env.private_key.replace(/\\n/g, '\n');
console.log(firebaseAdminPrivateKey);

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
const app = express();
const port = process.env.PORT || 3000;

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(bodyParser.json());

app.get("/status", (req, res) => {
  res.send("Check Status");
});

app.post('/VerificationLink', async (req, res) => {
  const userData = req.body;
  console.log(userData);
  const actionCodeSettings = {
    url: `<hosted_firebase_url_link>`, // Replace with your hosted Firebase URL
    handleCodeInApp: true,
    android: {
      packageName: '<project_id>' // Replace with your project ID
    }
  };
  try {
    const link = await admin.auth().generateSignInWithEmailLink(userData.email, actionCodeSettings);
    // Here, send the link via email using a service like Nodemailer or Mailgun
    res.json({
      success: true,
      link: link
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
});

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
