const express = require("express");
const {
  register,
  login,
  deleteDoctor,
  updateDoctor,
  getAllDoctors,
  updateAppointment,
  findDoctor
} = require("../Controllers/Doctor.controller");
const DoctorRouter = express.Router();
const Auth = require("../Middlewares/JWT.authentication");
const { DoctorAuth } = require("../Middlewares/RoleBased.authentication");

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

/**
 * @swagger
 * /doctors/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Email already exists
 */

/**
 * @swagger
 * /doctors/login:
 *   post:
 *     summary: Login as doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /doctors/all:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all doctors
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /doctors/{doctorId}:
 *   patch:
 *     summary: Update doctor info
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specialization:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       404:
 *         description: Doctor not found
 */
/**
 * @swagger
 * /doctors/{doctorId}:
 *   delete:
 *     summary: Delete doctor by ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Find doctor by query (e.g., id, name, email)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor found successfully
 *       404:
 *         description: Doctor not found
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /doctors/appoinment/{doctorId}:
 *   patch:
 *     summary: Update appointment details for a doctor
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 *       403:
 *         description: Unauthorized
 */


// Doctor Registration
DoctorRouter.post("/register", register);

// Doctor Login
DoctorRouter.post("/login", login);

// Doctor Deletion
DoctorRouter.delete("/:doctorId", Auth, DoctorAuth, deleteDoctor);

// Doctor Update
// DoctorRouter.patch("/:doctorId", Auth, DoctorAuth, updateDoctor);
DoctorRouter.patch("/:doctorId",Auth,DoctorAuth, updateDoctor);

// All Doctors Data
DoctorRouter.get("/all",Auth, getAllDoctors);
//find Doctor by id
DoctorRouter.get("/:doctorId", Auth, DoctorAuth, findDoctor);
//only do changes in appoinment
DoctorRouter.patch("/appoinment/:doctorId", Auth, DoctorAuth, updateAppointment);

module.exports = DoctorRouter;
