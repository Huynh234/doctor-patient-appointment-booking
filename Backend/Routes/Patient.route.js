const express = require("express");
const {
  registerPatient,
  loginPatient,
  getPatientById,
  updatePatientById,
  deletePatientById,
  updateAppointment
} = require("../Controllers/Patient.controller");
const Auth = require("../Middlewares/JWT.authentication");
const { PatientAuth } = require("../Middlewares/RoleBased.authentication");
const PatientRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: API quản lý bệnh nhân
 */

/**
 * @swagger
 * /patients/register:
 *   post:
 *     summary: Đăng ký bệnh nhân mới
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mai
 *               lastName:
 *                 type: string
 *                 example: Nguyen
 *               email:
 *                 type: string
 *                 example: mai@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: female
 *               bloodGroup:
 *                 type: string
 *                 example: O+
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1999-09-15
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email đã tồn tại
 */

/**
 * @swagger
 * /patients/login:
 *   post:
 *     summary: Đăng nhập bệnh nhân
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: mai@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Đăng nhập thành công + JWT token
 *       400:
 *         description: Sai email hoặc mật khẩu
 */

/**
 * @swagger
 * /patients/{patientId}:
 *   get:
 *     summary: Lấy thông tin bệnh nhân theo ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trả về thông tin bệnh nhân
 *       404:
 *         description: Không tìm thấy bệnh nhân
 *
 *   patch:
 *     summary: Cập nhật thông tin bệnh nhân theo ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               bloodGroup:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy bệnh nhân
 *
 *   delete:
 *     summary: Xóa bệnh nhân theo ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy bệnh nhân
 */

/**
 * @swagger
 * /patients/appointment/{patientId}:
 *   patch:
 *     summary: Gán lịch hẹn cho bệnh nhân
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cập nhật lịch hẹn thành công
 *       404:
 *         description: Không tìm thấy bệnh nhân hoặc lịch hẹn
 */


// Register a new patient
PatientRouter.post("/register", registerPatient);

// Login a patient
PatientRouter.post("/login", loginPatient);

// Get a patient by ID
PatientRouter.get("/:patientId", Auth, PatientAuth, getPatientById);

// Update a patient by ID
PatientRouter.patch("/:patientId",Auth,PatientAuth, updatePatientById);
// PatientRouter.patch("/:patientId", updatePatientById);


PatientRouter.patch("/appointment/:patientId",Auth,PatientAuth, updateAppointment);

// Delete a patient by ID
PatientRouter.delete("/:patientId", Auth, PatientAuth, deletePatientById);

module.exports = PatientRouter;
