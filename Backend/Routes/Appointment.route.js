const express = require("express");
const AppointmentRouter = express.Router();
const {
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById,
  getPatientAppointmentById,
  getDoctorAppointmentById
} = require("../Controllers/Appointment.controller");
const Auth = require("../Middlewares/JWT.authentication");

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

// Create a new appointment
AppointmentRouter.post("/", createAppointment);

// Get a single appointment by ID
AppointmentRouter.get("/doctor/:doctorId", getDoctorAppointmentById);

AppointmentRouter.get("/patient/:patientId", getPatientAppointmentById);

// Update an appointment by ID
AppointmentRouter.patch("/:appointmentId", Auth, updateAppointmentById);   

// Delete an appointment by ID
AppointmentRouter.delete("/:appointmentId", Auth, deleteAppointmentById);


module.exports = AppointmentRouter;
