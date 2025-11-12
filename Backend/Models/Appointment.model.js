// models/Appointment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/data");
const Patient = require("./Patient.model");
const Doctor = require("./Doctor.model");

const Appointment = sequelize.define("Appointment", {
  appointmentId: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  appointmentDate: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  startTime: { 
    type: "NVARCHAR(20)", 
    allowNull: false 
  },
  endTime: { 
    type: "NVARCHAR(20)", 
    allowNull: false 
  },
  status: {
    type: "NVARCHAR(20)",   // dùng STRING thay vì ENUM cho MSSQL
    allowNull: false,
    defaultValue: "scheduled"
  },
  disease: { 
    type: "NVARCHAR(255)", 
    allowNull: false 
  }
}, {
  tableName: "Appointments",
  timestamps: false
});

// Relationships
Patient.hasMany(Appointment, { 
  foreignKey: "patientId", 
  onDelete: "CASCADE" 
});
Appointment.belongsTo(Patient, { 
  foreignKey: "patientId" 
});

Doctor.hasMany(Appointment, { 
  foreignKey: "doctorId", 
  onDelete: "CASCADE" 
});
Appointment.belongsTo(Doctor, { 
  foreignKey: "doctorId" 
});

module.exports = Appointment;
