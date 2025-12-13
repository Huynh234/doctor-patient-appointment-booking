// controllers/Appointment.controller.js
const Appointment = require("../Models/Appointment.model");
const Doctor = require("../Models/Doctor.model");
const Patient = require("../Models/Patient.model");
const { sendEmailAndLog } = require("./SendMail.controller");
const { Op, Sequelize } = require("sequelize");
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

module.exports = {
  createAppointment,
  getDoctorAppointmentById,
  getPatientAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
};
