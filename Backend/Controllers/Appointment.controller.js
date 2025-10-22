// controllers/Appointment.controller.js
const Appointment = require("../Models/Appointment.model");
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");

// Tạo lịch hẹn mới
const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointmentDate,
      startTime,
      endTime,
      status,
      disease,
    } = req.body;

    const newAppointment = await Appointment.create({
      patientId: patient,
      doctorId: doctor,
      appointmentDate,
      startTime,
      endTime,
      status,
      disease,
    });
    // ====> Gửi thông báo realtime đến doctor & patient <====
    req.io.to(`doctor_${newAppointment.doctorId}`).emit("appointmentAdded", newAppointment);
    req.io.to(`patient_${newAppointment.patientId}`).emit("appointmentAdded", newAppointment);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy danh sách lịch hẹn của 1 bác sĩ
const getDoctorAppointmentById = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const appointments = await Appointment.findAll({
      where: { doctorId },
      include: [Doctor, Patient], // lấy thông tin bác sĩ + bệnh nhân
    });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy danh sách lịch hẹn của 1 bệnh nhân
const getPatientAppointmentById = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const appointments = await Appointment.findAll({
      where: { patientId },
      include: [Doctor, Patient],
    });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật lịch hẹn
const updateAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    const [updated] = await Appointment.update(req.body, {
      where: { id: appointmentId },
    });

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [Doctor, Patient],
    });
    // Emit event cập nhật
    req.io.to(`doctor_${updatedAppointment.doctorId}`).emit("appointmentUpdated", updatedAppointment);
    req.io.to(`patient_${updatedAppointment.patientId}`).emit("appointmentUpdated", updatedAppointment);
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Xóa lịch hẹn
const deleteAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    await appointment.destroy();

    req.io.to(`doctor_${appointment.doctorId}`).emit("appointmentDeleted", appointmentId);
    req.io.to(`patient_${appointment.patientId}`).emit("appointmentDeleted", appointmentId);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createAppointment,
  getDoctorAppointmentById,
  getPatientAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
};
