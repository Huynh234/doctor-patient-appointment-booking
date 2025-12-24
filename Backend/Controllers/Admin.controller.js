// controllers/Admin.controller.js
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");
const Appointment = require("../Models/Appointment.model");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const getRandomDoctorImage = require("../Utils/StaticData");
const puppeteer = require("puppeteer");
const { PassThrough } = require("stream");

// // Giả lập log file
// const LOG_FILE = path.join(__dirname, "../logs/admin-actions.log");

// const logAction = (adminId, action, details) => {
//   const entry = `[${new Date().toISOString()}] [Admin:${adminId}] ${action} - ${details}\n`;
//   fs.appendFileSync(LOG_FILE, entry, "utf8");
// };

/**
 * DUYỆT BÁC SĨ
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

//  KHÓA / MỞ KHÓA NGƯỜI DÙNG (Doctor hoặc Patient)

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

//  PHÂN QUYỀN (ví dụ: set role)
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


// //  THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG
// const getSystemStats = async (req, res) => {
//   try {
//     const totalDoctors = await Doctor.count();
//     const activeDoctors = await Doctor.count({ where: { status: true } });
//     const totalPatients = await Patient.count();
//     const totalAppointments = await Appointment.count();

//     const recentAppointments = await Appointment.findAll({
//       limit: 5,
//       order: [["appointmentDate", "DESC"]],
//       include: [Doctor, Patient]
//     });

//     const stats = {
//       totalDoctors,
//       activeDoctors,
//       totalPatients,
//       totalAppointments,
//       recentAppointments
//     };

//     logAction(req.adminId, "View System Stats", "Viewed general system statistics");
//     res.json(stats);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
//   }
// };

// 
// XUẤT BÁO CÁO HOẠT ĐỘNG HỆ THỐNG
// const exportReport = async (req, res) => {
//   try {
//     const fromDate = req.query.from || "2020-01-01";
//     const toDate = req.query.to || new Date().toISOString().split("T")[0];

//     const appointments = await Appointment.findAll({
//       where: {
//         appointmentDate: { [Op.between]: [fromDate, toDate] }
//       },
//       include: [Doctor, Patient]
//     });

//     const report = appointments.map(a => ({
//       AppointmentID: a.appointmentId,
//       Doctor: `${a.Doctor.firstName} ${a.Doctor.lastName}`,
//       Patient: `${a.Patient.firstName} ${a.Patient.lastName}`,
//       Date: a.appointmentDate,
//       Time: `${a.startTime} - ${a.endTime}`,
//       Status: a.status,
//       Disease: a.disease
//     }));

//     logAction(req.adminId, "Export Report", `From=${fromDate} To=${toDate}`);

//     res.json({
//       fromDate,
//       toDate,
//       totalAppointments: report.length,
//       report
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
//   }
// };

// // XEM LOG HOẠT ĐỘNG QUẢN TRỊ
// const viewAdminLogs = (req, res) => {
//   try {
//     if (!fs.existsSync(LOG_FILE)) return res.json({ logs: [] });
//     const logs = fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(l => l.trim());
//     res.json({ logs });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    const {
      type,
      contact,
      status,
      page = 1,
      limit = 10,
      sort = "desc",
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

    res.status(200).json({
      total: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const importDoctorsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload file CSV" });
    }

    const doctors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        doctors.push(row);
      })
      .on("end", async () => {
        try {
          for (const item of doctors) {
            // kiểm tra email trùng
            const existed = await Doctor.findOne({
              where: { email: item.email }
            });
            if (existed) continue;

            const hashedPassword = item.password.startsWith("$2b$")
              ? item.password
              : await bcrypt.hash(item.password, 10);

            await Doctor.create({
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              password: hashedPassword,
              specialty: item.specialty,
              clinicLocation: item.clinicLocation,
              contactNumber: item.contactNumber,
              workingHours: item.workingHours,
              about: item.about,
              licenseCode: item.licenseCode,
              status: item.status == 1,
              approve: item.approve == 1,
              profile: getRandomDoctorImage()
            });
          }

          fs.unlinkSync(req.file.path); // xóa file sau khi import

          res.json({
            message: "Import bác sĩ từ CSV thành công",
            total: doctors.length
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Lỗi khi import dữ liệu" });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const exportAllUsersPDF = async (req, res) => {
  let browser;
  try {
    // ---- Lấy toàn bộ dữ liệu ----
    const [doctors, patients] = await Promise.all([
      Doctor.findAll({
        attributes: [
          "doctorId",
          "firstName",
          "lastName",
          "email",
          "specialty",
          "clinicLocation",
          "contactNumber",
          "status",
          "approve",
          "createdAt",
        ],
      }),
      Patient.findAll({
        attributes: [
          "patientId",
          "firstName",
          "lastName",
          "email",
          "contactNumber",
          "status",
          "createdAt",
        ],
      }),
    ]);

    // ---- Chuẩn hoá ----
    const formattedDoctors = doctors.map((d, i) => ({
      stt: i + 1,
      name: `${d.firstName} ${d.lastName}`,
      email: d.email,
      contactNumber: d.contactNumber,
      status: d.status,
      userType: "Bác sĩ",
      createdAt: d.createdAt,
    }));

    const formattedPatients = patients.map((p, i) => ({
      stt: formattedDoctors.length + i + 1,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      contactNumber: p.contactNumber,
      status: p.status,
      userType: "Bệnh nhân",
      createdAt: p.createdAt,
    }));

    const allUsers = [...formattedDoctors, ...formattedPatients];

    // ---- HTML ----
    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #333;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: left;
    }
    th {
      background: #2563eb;
      color: white;
    }
    tr:nth-child(even) {
      background: #f3f4f6;
    }
    .doctor {
      color: #2563eb;
      font-weight: bold;
    }
    .patient {
      color: #16a34a;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      font-size: 10px;
      text-align: right;
      color: #555;
    }
  </style>
</head>
<body>
  <h1>DANH SÁCH TẤT CẢ NGƯỜI DÙNG</h1>

  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Tên</th>
        <th>Email</th>
        <th>SĐT</th>
        <th>Loại</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${allUsers
        .map(
          (u) => `
        <tr>
          <td>${u.stt}</td>
          <td>${u.name}</td>
          <td>${u.email || "-"}</td>
          <td>${u.contactNumber || "-"}</td>
          <td class="${u.userType === "Bác sĩ" ? "doctor" : "patient"}">
            ${u.userType}
          </td>
          <td>${u.status ? "Kích hoạt" : "Khóa" || "-"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    Xuất lúc: ${new Date().toLocaleString("vi-VN")}
  </div>
</body>
</html>
`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    const stream = new PassThrough();
    stream.end(pdfBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tat_ca_nguoi_dung.pdf"
    );

    stream.pipe(res);

    await browser.close();
  } catch (error) {
    console.error("Xuất PDF puppeteer lỗi:", error);
    if (browser) await browser.close();
    res.status(500).json({ message: "Xuất PDF thất bại" });
  }
};


module.exports = {
  approveDoctor,
  toggleUserStatus,
  createUserAccount,
  getAllUsers,
  importDoctorsFromCSV,
  exportAllUsersPDF,
}