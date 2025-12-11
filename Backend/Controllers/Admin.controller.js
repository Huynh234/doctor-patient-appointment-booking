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
    if (!doctor) return res.status(404).json({ message: "Bác sĩ không tồn tại" });

    doctor.approve = approve;
    await doctor.save();

    res.status(200).json({ message: approve ? "Bác sĩ đã được duyệt" : "Bác sĩ bị từ chối", doctor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi duyệt bác sĩ" });
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
    else return res.status(400).json({ message: "Loại người dùng không hợp lệ" });

    const user = await model.findByPk(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `Người dùng đã được ${status ? "kích hoạt" : "khóa"} thành công`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
    else return res.status(400).json({ message: "Loại người dùng không hợp lệ" });

    // Kiểm tra email tồn tại
    const existing = await model.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

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
    res.status(201).json({ message: `${userType} đã được tạo thành công`, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {
      type,            // 'doctor' | 'patient'
      contact,         // tìm theo email hoặc contactNumber
      status,          // lọc trạng thái
      page = 1,        // phân trang
      limit = 10,
      sort = "desc",   // sắp xếp theo ngày tạo
    } = req.query;

    // ---- Xây điều kiện lọc chung ----
    const buildFilter = () => {
      const filter = {};
      if (contact) {
        filter[Op.or] = [
          { email: { [Op.like]: `%${contact}%` } },
          { contactNumber: { [Op.like]: `%${contact}%` } },
        ];
      }
      if (status !== undefined) filter.status = status;
      return filter;
    };

    const filter = buildFilter();

    // ---- Truy vấn 2 bảng song song ----
    const [doctors, patients] = await Promise.all([
      (!type || type === "doctor")
        ? Doctor.findAll({
            where: filter,
            attributes: [
              "doctorId",
              "firstName",
              "lastName",
              "email",
              "specialty",
              "clinicLocation",
              "contactNumber",
              "profile",
              "about",
              "licenseCode",
              "status",
              "approve",
              "createdAt",
            ],
          })
        : Promise.resolve([]),

      (!type || type === "patient")
        ? Patient.findAll({
            where: filter,
            attributes: [
              "patientId",
              "firstName",
              "lastName",
              "email",
              "dateOfBirth",
              "gender",
              "contactNumber",
              "address",
              "city",
              "bloodGroup",
              "status",
              "createdAt",
            ],
          })
        : Promise.resolve([]),
    ]);

    // ---- Chuẩn hóa dữ liệu về cùng format ----
    const formattedDoctors = doctors.map((d) => ({
      id: d.doctorId,
      name: `${d.firstName} ${d.lastName}`,
      email: d.email,
      contactNumber: d.contactNumber,
      status: d.status,
      approve: d.approve,
      userType: "doctor",
      specialty: d.specialty,
      clinicLocation: d.clinicLocation,
      profile: d.profile,
      about: d.about,
      licenseCode: d.licenseCode,
      createdAt: d.createdAt,
    }));

    const formattedPatients = patients.map((p) => ({
      id: p.patientId,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      contactNumber: p.contactNumber,
      approve: null,
      status: p.status,
      userType: "patient",
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      address: p.address,
      city: p.city,
      bloodGroup: p.bloodGroup,
      createdAt: p.createdAt,
    }));

    // ---- Gộp tất cả lại ----
    let allUsers = [...formattedDoctors, ...formattedPatients];

    // ---- Sắp xếp theo ngày tạo ----
    allUsers.sort((a, b) =>
      sort === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

    // ---- Phân trang ----
    const start = (page - 1) * limit;
    const end = start + Number(limit);
    const paginatedUsers = allUsers.slice(start, end);

    res.status(200).json({
      total: allUsers.length,
      page: Number(page),
      limit: Number(limit),
      users: paginatedUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
    approveDoctor,
    toggleUserStatus,
    createUserAccount,
    getSystemStats,
    exportReport,
    viewAdminLogs,
    getAllUsers
}