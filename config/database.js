const { Sequelize } = require('sequelize');
const config = require('./config.js');
const pg = require('pg');
const session = require('express-session');


const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// const sequelize = new Sequelize(
//   dbConfig.database,
//   dbConfig.username,
//   dbConfig.password,
//   {
//     host: dbConfig.host,
//     dialect: dbConfig.dialect,
//     logging:console.log
//   }
// );
const sequelize = new Sequelize('postgres://default:gQA5wxdkf6mz@ep-noisy-brook-58368266.ap-southeast-1.postgres.vercel-storage.com:5432/verceldb',{
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
    },
  },
  logging:console.log,
})



module.exports = sequelize