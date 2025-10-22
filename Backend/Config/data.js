// config/data.js
const { Sequelize } = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(process.env.CSTR, {
  dialectModule: require("tedious"),
  logging: false,
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});

module.exports = sequelize;