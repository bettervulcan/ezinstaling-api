import * as dotenv from "dotenv";
dotenv.config();

const firebase = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const mongodb = {
  url: process.env.mongodburl,
};

const base = {
  mode: process.env.DEV_MODE == "true" ? "development" : "production",
  frontend_url: process.env.FRONTEND_URL,
  port: process.env.SERVER_PORT || 8080,
  openaiApiKey: process.env.OPENAI_APIKEY,
  clusters: false,
  email_login: process.env.EMAIL_LOGIN,
  email_password: process.env.EMAIL_PASSWORD,
  email_host: process.env.EMAIL_HOST,
};

export { firebase, mongodb, base };
