const express = require("express");
const AppointmentRouter = express.Router();
const {
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
  getPatientAppointmentById,
  getDoctorAppointmentById,
  exportDoctorAppointmentsToPDF,
  exportInvoicePDF
} = require("../Controllers/Appointment.controller");
const Auth = require("../Middlewares/JWT.authentication");
const { DoctorAuth } = require("../Middlewares/RoleBased.authentication");

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         patientId:
 *           type: integer
 *           example: 5
 *         doctorId:
 *           type: integer
 *           example: 2
 *         appointmentDate:
 *           type: string
 *           format: date
 *           example: "2025-09-18"
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           example: "10:00"
 *         status:
 *           type: string
 *           example: "pending"
 *         disease:
 *           type: string
 *           example: "Flu"
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient:
 *                 type: integer
 *                 example: 1
 *               doctor:
 *                 type: integer
 *                 example: 2
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-09-20"
 *               startTime:
 *                 type: string
 *                 example: "08:30"
 *               endTime:
 *                 type: string
 *                 example: "09:00"
 *               status:
 *                 type: string
 *                 example: "pending"
 *               disease:
 *                 type: string
 *                 example: "Headache"
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */

/**
 * @swagger
 * /appointments/doctor/{doctorId}:
 *   get:
 *     summary: Get all appointments of a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments/patient/{patientId}:
 *   get:
 *     summary: Get all appointments of a patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments/{appointmentId}:
 *   patch:
 *     summary: Update appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: "confirmed"
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Appointment not found
 *
 *   delete:
 *     summary: Delete appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /appointments/export/pdf/{doctorId}:
 *   get:
 *     summary: Xuất danh sách lịch hẹn của bác sĩ ra PDF
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bác sĩ
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-12-16
 *         description: Lọc lịch hẹn theo ngày (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Xuất PDF thành công
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /appointments/invoice/{appointmentId}:
 *   post:
 *     summary: Tạo và tải hóa đơn khám bệnh dạng PDF
 *     description: |
 *       API nhận thông tin dịch vụ và thuốc,
 *       kết hợp với lịch hẹn để xuất hóa đơn PDF.
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - examFee
 *               - medicines
 *             properties:
 *               service:
 *                 type: string
 *                 example: Khám nội tổng quát
 *               examFee:
 *                 type: number
 *                 example: 150000
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - quantity
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Paracetamol
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 10000
 *     responses:
 *       200:
 *         description: Tạo và tải PDF thành công
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy lịch hẹn
 *       500:
 *         description: Lỗi tạo PDF
 */



// Create a new appointment
AppointmentRouter.post("/", createAppointment);

// Get a single appointment by ID
AppointmentRouter.get("/doctor/:doctorId", getDoctorAppointmentById);

AppointmentRouter.get("/patient/:patientId", getPatientAppointmentById);

// Update an appointment by ID
AppointmentRouter.patch("/:appointmentId", Auth, updateAppointmentById);   

// Delete an appointment by ID
AppointmentRouter.delete("/:appointmentId", Auth, deleteAppointmentById);

AppointmentRouter.get("/export/pdf/:doctorId", Auth, DoctorAuth, exportDoctorAppointmentsToPDF);

AppointmentRouter.post("/invoice/:appointmentId", Auth, DoctorAuth, exportInvoicePDF);


module.exports = AppointmentRouter;
