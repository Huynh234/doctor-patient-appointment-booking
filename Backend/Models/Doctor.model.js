// models/Doctor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/data");

const Doctor = sequelize.define("Doctor", {
  doctorId: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  profile: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  firstName: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  lastName: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING(150), 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  specialty: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  clinicLocation: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  contactNumber: { 
    type: DataTypes.STRING(20), 
    allowNull: false 
  },
  workingHours: { 
    type: DataTypes.STRING(100) 
  },
  about: { 
    type: DataTypes.TEXT 
  }
}, {
  tableName: "Doctors",
  timestamps: false
});

module.exports = Doctor;
