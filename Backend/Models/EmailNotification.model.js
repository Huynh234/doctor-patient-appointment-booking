// models/EmailNotification.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../Config/data");
const Appointment = require("./Appointment.model");

const EmailNotification = sequelize.define("EmailNotification", {
  emailId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender: {
    type: "NVARCHAR(150)",
    allowNull: false,
    defaultValue: "no-reply@medicalsystem.com"
  },
  receiver: {
    type: "NVARCHAR(250)",
    allowNull: false
  },
  subject: {
    type: "NVARCHAR(255)",
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "EmailNotifications",
  timestamps: false
});

// Quan hệ duy nhất: Email gắn với 1 lịch hẹn cụ thể
EmailNotification.belongsTo(Appointment, {
  foreignKey: "appointmentId",
  onDelete: "CASCADE"
});

module.exports = EmailNotification;
