// Session.js

const { DataTypes } = require('sequelize');
const session = require('express-session');
const sequelize= require('./config/database'); // Adjust the path based on your project structure

const Session = sequelize.define('Session', {
  sid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  expires: {
    type: DataTypes.DATE,
  },
  data: {
    type: DataTypes.STRING, // Adjust the data type based on your setup
  },
});


const syncDatabase = async () => {
    await Session.sync();
  };
  
  // Call the function to synchronize the database
syncDatabase();
module.exports = Session;
