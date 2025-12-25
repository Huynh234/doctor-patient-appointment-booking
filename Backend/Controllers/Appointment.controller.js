// controllers/Appointment.controller.js
const Appointment = require("../Models/Appointment.model");
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");
const { sendEmailAndLog } = require("./SendMail.controller");
const { Op, Sequelize } = require("sequelize");
const puppeteer = require("puppeteer");
const { PassThrough } = require("stream");

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
    const role = req.body.role;
    const conflictAppointment = await Appointment.findOne({
      where: {
        doctorId: doctor,
        appointmentDate: appointmentDate,
        status: {
          [Op.ne]: "canceled",
        },
        [Op.and]: [
          {
            startTime: {
              [Op.lt]: endTime,
            },
          },
          {
            endTime: {
              [Op.gt]: startTime,
            },
          },
        ],
      },
    });

    if (conflictAppointment) {
      return res.status(409).json({
        message: "Bác sĩ đã có lịch hẹn trong khoảng thời gian này",
      });
    }
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
    await sendWithRole(role, newAppointment, 'được tạo bạn hãy quay lại trang web để xem chi tiết');
    req.io.to(`doctor_${newAppointment.doctorId}`).emit("appointmentAdded", newAppointment);
    req.io.to(`patient_${newAppointment.patientId}`).emit("appointmentAdded", newAppointment);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách lịch hẹn của 1 bác sĩ
const getDoctorAppointmentById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const whereCondition = {
      doctorId
    };
    if (date) {
      whereCondition.appointmentDate = date;
    }
    const appointments = await Appointment.findAll({
      where: whereCondition,
      include: [Doctor, Patient],
      order: [
        ["appointmentDate", "ASC"],
        ["startTime", "ASC"]
      ]
    });
    if (!appointments || appointments.length === 0) {
      return res.status(200).json({
        message: "Không tìm thấy lịch hẹn theo ngày này"
      });
    }
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Lỗi lấy lịch hẹn:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật lịch hẹn
const updateAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const role = req.body.role;
    const updated = await Appointment.update(req.body, {
      where: { appointmentId: appointmentId },
    });

    if (!updated) {
      return res.status(404).json({ message: "Lịch hẹn không tồn tại" });
    }

    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [Doctor, Patient],
    });
    // Emit event cập nhật
    await sendWithRole(role, updatedAppointment, 'được cập nhật trạng thái vui lòng vào trang web để xem chi tiết ');
    req.io.to(`doctor_${updatedAppointment.doctorId}`).emit("appointmentUpdated", updatedAppointment);
    req.io.to(`patient_${updatedAppointment.patientId}`).emit("appointmentUpdated", updatedAppointment);
    res.status(200).json({ success: updatedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Xóa lịch hẹn
const deleteAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    const appointment = await Appointment.findByPk(appointmentId, { include: [Doctor, Patient], });
    const role = req.body.role;
    if (!appointment) return res.status(404).json({ message: "Lịch hẹn không tồn tại" });
    await sendWithRole(role, appointment, 'bị xóa chi tiết hãy xem tại trang web');
    req.io.to(`doctor_${appointment.doctorId}`).emit("appointmentDeleted", appointmentId);
    req.io.to(`patient_${appointment.patientId}`).emit("appointmentDeleted", appointmentId);
    await Appointment.destroy({ where: { appointmentId } });
    res.status(200).json({ message: "Xóa lịch hẹn thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const sendWithRole = async (role, appointment, tex) => {
  if (role !== 'doctor' && role !== 'patient') {
    return { message: "Invalid role" };
  }
  if (role === 'doctor') {
    const em = await Patient.findByPk(appointment.patientId);
    const mailData = {
      form: "Hệ thống đặt lịch trực tuyến",
      receiver: em?.email,
      subject: "Thông tin lịch hẹn",
      message: `<p> Lịch hẹn của ${appointment.Patient.firstName + " " + appointment.Patient.lastName} vào ngày ${appointment.appointmentDate} từ ${appointment.startTime} đến ${appointment.endTime} với bác sỹ ${appointment.Doctor.firstName + " " + appointment.Doctor.lastName} đã ${tex}.</p>`,
      appointmentId: appointment.appointmentId
    };
    await sendEmailAndLog(mailData);
  } else if (role === 'patient') {
    const em2 = await Doctor.findByPk(appointment.doctorId);
    const mailData2 = {
      form: "Hệ thống đặt lịch trực tuyến",
      receiver: em2?.email,
      subject: "Thông tin lịch hẹn",
      message: `<p> Lịch hẹn của ${appointment.Patient.firstName + " " + appointment.Patient.lastName} vào ngày ${appointment.appointmentDate} từ ${appointment.startTime} đến ${appointment.endTime} với bác sỹ ${appointment.Doctor.firstName + " " + appointment.Doctor.lastName} đã ${tex}.</p>`,
      appointmentId: appointment.appointmentId
    };
    await sendEmailAndLog(mailData2);
  }
}

const exportDoctorAppointmentsToPDF = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const whereCondition = { doctorId };
    if (date) whereCondition.appointmentDate = date;

    const appointments = await Appointment.findAll({
      where: whereCondition,
      include: [Doctor, Patient],
      order: [
        ["appointmentDate", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        message: "Không có lịch hẹn để xuất PDF",
      });
    }

    // ===== HTML TEMPLATE =====
    const rows = appointments
      .map(
        (a, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${a.appointmentDate}</td>
          <td>${a.startTime}</td>
          <td>${a.endTime}</td>
          <td>${a.Patient.firstName} ${a.Patient.lastName}</td>
          <td>${a.disease || ""}</td>
          <td>${translateStatus(a.status)}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            body { font-family: Arial, sans-serif; }
            h2 { text-align: center; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: center;
            }
            th {
              background: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>DANH SÁCH LỊCH HẸN BÁC SĨ</h2>
          <p><b>Bác sĩ:</b> ${appointments[0].Doctor.firstName} ${appointments[0].Doctor.lastName}</p>
          <p><b>Ngày:</b> ${date || "Tất cả"}</p>

          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày khám</th>
                <th>Giờ bắt đầu</th>
                <th>Giờ kết thúc</th>
                <th>Bệnh nhân</th>
                <th>Bệnh lý</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // ===== TẠO PDF =====
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const stream = new PassThrough();
    stream.end(pdfBuffer);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=appointments.pdf"
    );

    stream.pipe(res);
  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    res.status(500).json({ message: "Lỗi xuất PDF" });
  }
};

const exportInvoicePDF = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [Patient, Doctor],
    });
    if (!appointment) {
      return res.status(404).json({ message: "Lịch hẹn không tồn tại" });
    }
    const { service, examFee } = req.body;
    const medicines = Array.isArray(req.body.medicines)
      ? req.body.medicines
      : [];

    const medicineRows = medicines.length > 0
      ? medicines.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${m.name || ""}</td>
        <td>${m.quantity || 0}</td>
        <td>${Number(m.price || 0).toLocaleString()} đ</td>
        <td>${(Number(m.quantity || 0) * Number(m.price || 0)).toLocaleString()} đ</td>
      </tr>
    `).join("")
      : `<tr><td colspan="5">Không có thuốc</td></tr>`;


    const medicineTotal = medicines.reduce(
      (sum, m) => sum + Number(m.quantity || 0) * Number(m.price || 0),
      0
    );

    const total = parseInt(medicineTotal) + parseInt(examFee);
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial; padding: 30px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: center; }
          th { background: #f2f2f2; }
          .info p { margin: 4px 0; }
          .total { text-align: right; margin-top: 15px; font-size: 16px; }
        </style>
      </head>
      <body>

        <h2>HÓA ĐƠN KHÁM BỆNH</h2>

        <div class="info">
          <p><b>Bác sĩ:</b> ${appointment.Doctor.firstName} ${appointment.Doctor.lastName}</p>
          <p><b>Bệnh nhân:</b> ${appointment.Patient.firstName} ${appointment.Patient.lastName}</p>
          <p><b>Ngày khám:</b> ${appointment.appointmentDate}</p>
          <p><b>Thời gian:</b> ${appointment.appointmentDate} (${appointment.startTime}- ${appointment.endTime})</p>
          <p><b>Dịch vụ:</b> ${service}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên thuốc</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${medicineRows}
          </tbody>
        </table>

        <div class="total">
          <p>Phí khám: <b>${examFee.toLocaleString()} đ</b></p>
          <p>Tiền thuốc: <b>${medicineTotal.toLocaleString()} đ</b></p>
          <p><b>TỔNG CỘNG: ${total.toLocaleString()} đ</b></p>
        </div>

      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const stream = new PassThrough();
    stream.end(pdfBuffer);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=invoi.pdf"
    );

    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo PDF hóa đơn" });
  }
};


const translateStatus = (status) => {
  switch (status) {
    case "scheduled":
      return "Đang lên lịch";
    case "completed":
      return "Đã duyệt";
    case "canceled":
      return "Đã hủy";
    default:
      return status;
  }
};


module.exports = {
  createAppointment,
  getDoctorAppointmentById,
  getPatientAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  exportDoctorAppointmentsToPDF,
  exportInvoicePDF
};
