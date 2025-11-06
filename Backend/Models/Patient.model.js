// models/Patient.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/data");

const Patient = sequelize.define("Patient", {
  patientId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
    defaultValue: "other"
  },
  contactNumber: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.STRING(255)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  bloodGroup: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "Patients",
  timestamps: true
});

module.exports = Patient;
