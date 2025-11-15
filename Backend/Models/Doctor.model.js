// models/Doctor.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/data");

const Doctor = sequelize.define("Doctor", {
  doctorId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  profile: {
    type: "NVARCHAR(500)",
    allowNull: true
  },
  firstName: {
    type: "NVARCHAR(100)",
    allowNull: false
  },
  lastName: {
    type: "NVARCHAR(100)",
    allowNull: false
  },
  email: {
    type: "NVARCHAR(150)",
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  specialty: {
    type: "NVARCHAR(100)",
    allowNull: false
  },
  clinicLocation: {
    type: "NVARCHAR(255)",
    allowNull: false
  },
  contactNumber: {
    type: "NVARCHAR(20)",
    allowNull: false
  },
  workingHours: {
    type: "NVARCHAR(100)",
    allowNull: true
  },
  about: {
    type: " NVARCHAR(500)",
    allowNull: true
  },
  licenseCode: {
    type: "NVARCHAR(50)",
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "Doctors",
  timestamps: true
});

module.exports = Doctor;
