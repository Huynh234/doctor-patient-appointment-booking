const { request } = require("express");
const bcrypt = require('bcrypt')
const jwt=require("jsonwebtoken")
const Doctor = require("../Models/Doctor.model");
const Appointment = require("../Models/Appointment.model");
const getRandomDoctorImage = require("../Utils/StaticData");
require("dotenv").config();
// controllers/Doctor.controller.js


// Đăng ký bác sĩ
const registerDoctor = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(400).json({ message: "Email already exists!", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = await Doctor.create({
      ...rest,
      email,
      password: hashedPassword,
      profile: getRandomDoctorImage(),
      status: true,
      approve : false
    });

    res.status(201).json({ newDoctor, message: "Doctor registration successful", status: true });
  } catch (error) {
    console.error("Register Doctor Error:", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Đăng nhập bác sĩ
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ where: { email } });

    if (!doctor) return res.status(404).json({ message: "Email not found!", status: false });

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(400).json({ message: "Incorrect password!", status: false });
    if(!doctor.approve) return res.status(401).json({message:"Doctor is not approve", status: false})
    if(!doctor.status) return res.status(401).json({message:"Doctor is not active", status: false})

    const token = jwt.sign({ id: doctor.doctorId, role: "doctor" }, process.env.secretKey, { expiresIn: "2h" });

    res.status(200).json({ message: "Login successful", token, user: doctor, status: true });
  } catch (error) {
    console.error("Login Doctor Error:", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};
// Xóa bác sĩ
const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const deleted = await Doctor.destroy({ where: { doctorId: doctorId } });

    if (!deleted) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật thông tin bác sĩ
const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const updated = await Doctor.update(req.body, { where: { doctorId: doctorId } });
    if (!updated) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const updatedDoctor = await Doctor.findByPk(doctorId);
    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy thông tin bác sĩ theo ID
const findDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const doctor = await Doctor.findByPk(doctorId, {
      where: {status : true},
      include: [Appointment],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy tất cả bác sĩ
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({where :{status : true}});
    res.status(200).json({ doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Thêm lịch hẹn cho bác sĩ
const updateAppointment = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { appointmentId } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Gán appointment cho doctor
    appointment.doctorId = doctorId;
    await appointment.save();

    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerDoctor,
  loginDoctor,
  deleteDoctor,
  updateDoctor,
  findDoctor,
  getAllDoctors,
  updateAppointment,
};
