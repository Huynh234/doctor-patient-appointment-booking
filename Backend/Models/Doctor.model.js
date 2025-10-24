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
    type: DataTypes.STRING,
    allowNull: true
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
    type: DataTypes.STRING(100),
    allowNull: true
  },
  about: {
    type: DataTypes.TEXT
  },
  licenseCode: {
    type: DataTypes.STRING(50),
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
