const express=require("express");

const AdminRouter=express.Router()
const {approveDoctor, toggleUserStatus, createUserAccount, getSystemStats, exportReport, viewAdminLogs} = require("../Controllers/Admin.controller");
const jwt=require("jsonwebtoken")
const Auth = require("../Middlewares/JWT.authentication");
const { AdminAuth } = require("../Middlewares/RoleBased.authentication");
require("dotenv").config()

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho quản trị viên
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Đăng nhập admin
 *     tags: [Admin]
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
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       201:
 *         description: Sai thông tin đăng nhập
 *       500:
 *         description: Lỗi server
 */

AdminRouter.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body
        if(email=="admin@gmail.com"){
            if(password=="admin"){
                var token = jwt.sign({ role: "admin" },`${process.env.secretKey}`);
                res.status(200).json({token,status:true,message:"Logged in sucessfully"})
            }else{
                res.status(201).json({status:false,message:"Wrong Credentials!"})
            }
        }else{
            res.status(201).json({status:false,message:"Wrong Credentials!"})

    }
    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Duyệt bác sĩ
/**
 * @swagger
 * /admin/approve-doctor:
 *   patch:
 *     summary: Duyệt hoặc từ chối tài khoản bác sĩ
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - approve
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 5
 *               approve:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái bác sĩ thành công
 *       404:
 *         description: Không tìm thấy bác sĩ
 */
AdminRouter.patch("/approve-doctor",Auth, AdminAuth, approveDoctor);

// Khóa/mở tài khoản
/**
 * @swagger
 * /admin/toggle-user-status:
 *   patch:
 *     summary: Kích hoạt hoặc khóa tài khoản người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *               - userId
 *               - status
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [doctor, patient]
 *                 example: doctor
 *               userId:
 *                 type: integer
 *                 example: 3
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái người dùng thành công
 */
AdminRouter.patch("/toggle-user-status",Auth, AdminAuth, toggleUserStatus);

// Thêm tài khoản mới (Doctor hoặc Patient)
/**
 * @swagger
 * /admin/create-user:
 *   post:
 *     summary: Thêm mới tài khoản bác sĩ hoặc bệnh nhân
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [doctor, patient]
 *                 example: "doctor"
 *               firstName:
 *                 type: string
 *                 example: "Nguyen"
 *               lastName:
 *                 type: string
 *                 example: "An"
 *               email:
 *                 type: string
 *                 example: "doctor.an@example.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               specialty:
 *                 type: string
 *                 example: "Cardiology"
 *               clinicLocation:
 *                 type: string
 *                 example: "Hanoi General Hospital"
 *               contactNumber:
 *                 type: string
 *                 example: "0905123456"
 *               licenseCode:
 *                 type: string
 *                 example: "LIC12345"
 *               bloodGroup:
 *                 type: string
 *                 example: "O+"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1999-02-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Nguyen Trai, Hanoi"
 *               city:
 *                 type: string
 *                 example: "Hanoi"
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
AdminRouter.post("/create-user", Auth, AdminAuth, createUserAccount);

// Thống kê
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Lấy thống kê tổng quan hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê hệ thống
 *       500:
 *         description: Lỗi khi lấy thống kê
 */
AdminRouter.get("/stats",Auth, AdminAuth, getSystemStats);

// Xuất báo cáo
/**
 * @swagger
 * /admin/export-report:
 *   get:
 *     summary: Xuất báo cáo hoạt động hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu lọc dữ liệu (yyyy-mm-dd)
 *         example: 2024-01-01
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc lọc dữ liệu (yyyy-mm-dd)
 *         example: 2024-12-31
 *     responses:
 *       200:
 *         description: Báo cáo được xuất thành công
 */
AdminRouter.get("/export-report",Auth, AdminAuth, exportReport);

// Xem log
/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Xem log hoạt động của quản trị viên
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách log hoạt động
 */
AdminRouter.get("/logs",Auth, AdminAuth, viewAdminLogs);

module.exports=AdminRouter