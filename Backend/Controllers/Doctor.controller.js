const { request } = require("express");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const Doctor = require("../Models/Doctor.model");
const Appointment = require("../Models/Appointment.model");
const getRandomDoctorImage = require("../Utils/StaticData");
const { Op, Sequelize } = require("sequelize");
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
      approve: false
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

    if (!doctor) return res.status(404).json({ message: "Email không tồn tại!", status: false });

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(400).json({ message: "Mật khẩu không đúng!", status: false });
    if (!doctor.approve) return res.status(401).json({ message: "Tài khoản đang chờ phê duyệt", status: false })
    if (!doctor.status) return res.status(401).json({ message: "Tài khoản bị khóa", status: false })

    const token = jwt.sign({ id: doctor.doctorId, role: "doctor" }, process.env.secretKey, { expiresIn: "2h" });

    res.status(200).json({ message: "Đăng nhập thành công", token, user: doctor, status: true });
  } catch (error) {
    console.error("Login Doctor Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", status: false });
  }
};
// Xóa bác sĩ
const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const deleted = await Doctor.destroy({ where: { doctorId: doctorId } });

    if (!deleted) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại" });
    }

    res.status(200).json({ message: "Xóa bác sĩ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật thông tin bác sĩ
const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const updated = await Doctor.update(req.body, { where: { doctorId: doctorId } });
    if (!updated) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại" });
    }

    const updatedDoctor = await Doctor.findByPk(doctorId);
    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy thông tin bác sĩ theo ID
const findDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const doctor = await Doctor.findByPk(doctorId, {
      where: { status: true },
      include: [Appointment],
    });

    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy tất cả bác sĩ
const getAllDoctors = async (req, res) => {
  const dn = req.query.dn;
  const dm = req.query.dm;

  const page = parseInt(req.query.page) || 0;   // page index
  const limit = parseInt(req.query.limit) || 10;
  const offset = page * limit;

  try {
    let where = { status: true };

    if (dn || dm) {
      where[Op.and] = [];

      if (dn) {
        where[Op.and].push(
          Sequelize.where(
            Sequelize.fn("concat", Sequelize.col("firstName"), " ", Sequelize.col("lastName")),
            { [Op.like]: `%${dn}%` }
          )
        );
      }

      if (dm) {
        where[Op.and].push({ specialty: { [Op.like]: `%${dm}%` } });
      }
    }

    const { rows, count } = await Doctor.findAndCountAll({
      where,
      limit,
      offset,
      order: [["doctorId", "DESC"]]
    });

    res.json({
      data: rows,
      total: count,
      page,
      limit
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Thêm lịch hẹn cho bác sĩ
const updateAppointment = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { appointmentId } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Bác sĩ không tồn tại" });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Lịch hẹn không tồn tại" });
    }

    // Gán appointment cho doctor
    appointment.doctorId = doctorId;
    await appointment.save();

    res.status(200).json({ message: "Cập nhật lịch hẹn thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
