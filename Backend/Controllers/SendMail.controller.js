// services/EmailNotification.service.js
const nodemailer = require("nodemailer");
const EmailNotification = require("../Models/EmailNotification.model");
const Appointment = require("../Models/Appointment.model");

/**
 * Gửi email và lưu lại thông tin vào CSDL
 * @param {Object} mailData - Dữ liệu email
 * @param {string} mailData.receiver - Địa chỉ email người nhận
 * @param {string} mailData.subject - Tiêu đề email
 * @param {string} mailData.message - Nội dung email (HTML hoặc text)
 * @param {number} [mailData.appointmentId] - ID của cuộc hẹn (nếu có)
 */
const sendEmailAndLog = async (mailData) => {
  const { form, receiver, subject, message, appointmentId } = mailData;

  // Kiểm tra dữ liệu cơ bản
  if (!receiver || !subject || !message || !form) {
    throw new Error("Thiếu thông tin bắt buộc (receiver, subject, message, form)");
  }

  try {
    // 1 Cấu hình transporter (dùng Gmail làm ví dụ)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS 
      }
    });

    // 2 Tạo nội dung email
    const mailOptions = {
      from: `Hệ thống đặt lịch trực tuyến \n ${form}`,
      to: receiver,
      subject: subject,
      html: message // có thể là text: message nếu không dùng HTML
    };

    // 3Gửi mail
    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent:", info.response);

    // 4Lưu lại bản ghi trong DB
    const savedEmail = await EmailNotification.create({
      sender: `Hệ thống đặt lịch trực tuyến \n ${form}`,
      receiver,
      subject,
      message,
      appointmentId: appointmentId || null
    });

    console.log(" Email log saved with ID:", savedEmail.emailId);
    return savedEmail;

  } catch (error) {
    console.error(" Lỗi khi gửi email:", error);
    throw new Error("Không thể gửi email: " + error.message);
  }
};

module.exports = {
  sendEmailAndLog
};
