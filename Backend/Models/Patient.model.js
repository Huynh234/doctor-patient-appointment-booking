// models/Patient.js
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
    type: DataTypes.STRING(10), 
    allowNull: false, 
    defaultValue: "other"   // Sequelize sẽ apply khi insert, không bị lỗi sync MSSQL
  },
  contactNumber: { 
    type: DataTypes.STRING(20) 
  },
  street: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  postalCode: { type: DataTypes.STRING(20) },
  bloodGroup: { 
    type: DataTypes.STRING(5), 
    allowNull: false 
  }
}, {
  tableName: "Patients",
  timestamps: false
});

module.exports = Patient;
