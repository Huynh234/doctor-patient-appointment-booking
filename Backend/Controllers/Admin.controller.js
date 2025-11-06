// controllers/Admin.controller.js
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");
const Appointment = require("../Models/Appointment.model");
const { Op } = require("sequelize");
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
const assignRole = async (req, res) => {
  try {
    const { userType, userId, role } = req.body;
    let model = null;

    if (userType === "doctor") model = Doctor;
    else if (userType === "patient") model = Patient;
    else return res.status(400).json({ message: "Invalid user type" });

    const user = await model.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // giả sử ta có cột "role" bổ sung trong DB
    user.role = role;
    await user.save();

    logAction(req.adminId, "Assign Role", `Type=${userType}, ID=${userId}, Role=${role}`);
    res.json({ message: "Role assigned successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning role" });
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
    assignRole,
    getSystemStats,
    exportReport,
    viewAdminLogs
}