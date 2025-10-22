const bcrypt = require('bcrypt');
const Patient = require("../Models/Patient.model");
const Appointment = require("../Models/Appointment.model");
const jwt=require("jsonwebtoken")
require("dotenv").config();

// controllers/Patient.controller.js

// Đăng ký bệnh nhân
const registerPatient = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already exists!", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ newPatient, message: "Registration successfully", status: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng nhập
const loginPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { email: req.body.email } });

    if (!patient) {
      return res.status(400).json({ message: "Email not found!", status: false });
    }

    // const passwordMatch = await bcrypt.compare(req.body.password, patient.password);
    // if (!passwordMatch) {
    //   return res.status(400).json({ message: "Incorrect password!", status: false });
    // }
    if(req.body.password !== patient.password){
       return res.status(400).json({ message: "Incorrect password!", status: false });
    }

    const token = jwt.sign({ userId: patient.patientId , role: "patient"}, process.env.secretKey);

    res.status(200).json({
      message: "Login successful!",
      status: true,
      token,
      userId: patient.patientId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy thông tin bệnh nhân theo ID
const getPatientById = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const patient = await Patient.findByPk(patientId, {
      include: [Appointment],
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật bệnh nhân theo ID
const updatePatientById = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const [updated] = await Patient.update(req.body, {
      where: { id: patientId },
    });

    if (!updated) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const updatedPatient = await Patient.findByPk(patientId);
    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Xóa bệnh nhân
const deletePatientById = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const deleted = await Patient.destroy({ where: { id: patientId } });

    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Thêm lịch hẹn vào bệnh nhân
const updateAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { appointmentId } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Gán lịch hẹn cho bệnh nhân
    appointment.patientId = patientId;
    await appointment.save();

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerPatient,
  loginPatient,
  getPatientById,
  updatePatientById,
  deletePatientById,
  updateAppointment,
};
