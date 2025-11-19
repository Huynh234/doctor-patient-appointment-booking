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
    type: "NVARCHAR(250)",
    allowNull: false
  },
  lastName: {
    type: "NVARCHAR(250)",
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
    type: "NVARCHAR(20)"
  },
  address: {
    type: "NVARCHAR(255)"
  },
  city: {
    type: "NVARCHAR(255)"
  },
  bloodGroup: {
    type: "NVARCHAR(10)",
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
