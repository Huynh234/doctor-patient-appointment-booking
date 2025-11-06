// controllers/Admin.controller.js
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");
const Appointment = require("../Models/Appointment.model");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Giả lập log file
const LOG_FILE = path.join(__dirname, "../logs/admin-actions.log");

const logAction = (adminId, action, details) => {
  const entry = `[${new Date().toISOString()}] [Admin:${adminId}] ${action} - ${details}\n`;
  fs.appendFileSync(LOG_FILE, entry, "utf8");
};

/**
 * ✅ DUYỆT BÁC SĨ
 * Admin có thể duyệt hoặc từ chối tài khoản bác sĩ mới.
 */
const approveDoctor = async (req, res) => {
  try {
    const { doctorId, approve } = req.body;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.status = approve ? true : false;
    await doctor.save();

    logAction(req.adminId, "Approve Doctor", `DoctorId=${doctorId}, Approved=${approve}`);
    res.json({ message: approve ? "Doctor approved" : "Doctor rejected", doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving doctor" });
  }
};

/**
 * ✅ KHÓA / MỞ KHÓA NGƯỜI DÙNG (Doctor hoặc Patient)
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { userType, userId, status } = req.body;
    let model = null;

    if (userType === "doctor") model = Doctor;
    else if (userType === "patient") model = Patient;
    else return res.status(400).json({ message: "Invalid user type" });

    const user = await model.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    logAction(req.adminId, "Toggle User Status", `Type=${userType}, ID=${userId}, Status=${status}`);
    res.json({ message: `User ${status ? "activated" : "deactivated"} successfully`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user status" });
  }
};

/**
 * ✅ PHÂN QUYỀN (ví dụ: set role)
 * Gợi ý: bạn có thể có thêm trường "role" trong bảng người dùng (ở đây giả lập)
 */
const createUserAccount = async (req, res) => {
  try {
    const { userType, firstName, lastName, email, password, specialty, clinicLocation, contactNumber, licenseCode, bloodGroup, dateOfBirth, gender, address, city } = req.body;

    let model = null;

    if (userType === "doctor") model = Doctor;
    else if (userType === "patient") model = Patient;
    else return res.status(400).json({ message: "Invalid user type" });

    // Kiểm tra email tồn tại
    const existing = await model.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = null;

    if (userType === "doctor") {
      newUser = await model.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        specialty,
        clinicLocation,
        contactNumber,
        licenseCode,
        workingHours: "08:00 - 17:00",
        status: true, // mặc định kích hoạt
      });
    } else {
      newUser = await model.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dateOfBirth,
        gender,
        contactNumber,
        address,
        city,
        bloodGroup,
        status: true,
      });
    }

    logAction(req.adminId, "Create User Account", `Type=${userType}, Email=${email}`);
    res.status(201).json({ message: `${userType} account created successfully`, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating account" });
  }
};

/**
 * ✅ THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG
 */
const getSystemStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.count();
    const activeDoctors = await Doctor.count({ where: { status: true } });
    const totalPatients = await Patient.count();
    const totalAppointments = await Appointment.count();

    const recentAppointments = await Appointment.findAll({
      limit: 5,
      order: [["appointmentDate", "DESC"]],
      include: [Doctor, Patient]
    });

    const stats = {
      totalDoctors,
      activeDoctors,
      totalPatients,
      totalAppointments,
      recentAppointments
    };

    logAction(req.adminId, "View System Stats", "Viewed general system statistics");
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching system stats" });
  }
};

/**
 * ✅ XUẤT BÁO CÁO HOẠT ĐỘNG HỆ THỐNG
 */
const exportReport = async (req, res) => {
  try {
    const fromDate = req.query.from || "2020-01-01";
    const toDate = req.query.to || new Date().toISOString().split("T")[0];

    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: { [Op.between]: [fromDate, toDate] }
      },
      include: [Doctor, Patient]
    });

    const report = appointments.map(a => ({
      AppointmentID: a.appointmentId,
      Doctor: `${a.Doctor.firstName} ${a.Doctor.lastName}`,
      Patient: `${a.Patient.firstName} ${a.Patient.lastName}`,
      Date: a.appointmentDate,
      Time: `${a.startTime} - ${a.endTime}`,
      Status: a.status,
      Disease: a.disease
    }));

    logAction(req.adminId, "Export Report", `From=${fromDate} To=${toDate}`);

    res.json({
      fromDate,
      toDate,
      totalAppointments: report.length,
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting report" });
  }
};

/**
 * ✅ XEM LOG HOẠT ĐỘNG QUẢN TRỊ
 */
const viewAdminLogs = (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE)) return res.json({ logs: [] });
    const logs = fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(l => l.trim());
    res.json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading logs" });
  }
};


module.exports = {
    approveDoctor,
    toggleUserStatus,
    createUserAccount,
    getSystemStats,
    exportReport,
    viewAdminLogs
}