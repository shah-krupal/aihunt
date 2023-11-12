const { DataTypes } = require('sequelize');
const sequelize = require('./config/database.js');
const bcrypt = require('bcrypt');

const User = sequelize.define('user', {
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey:true,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    googleId:{
        type: DataTypes.STRING,
        allowNull: true,
    }
});

User.beforeCreate(async (user) => {
    if(user.password)
    {
        try {
            const saltRounds = 10; 
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            user.password = hashedPassword;
          } catch (error) {
            throw new Error('Error hashing the password: ' + error.message);
          }
    }
  });

  const syncDatabase = async () => {
    await User.sync();
  };
  
  // Call the function to synchronize the database
  syncDatabase();
  

module.exports = User;