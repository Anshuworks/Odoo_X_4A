require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
};
