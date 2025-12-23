const express=require("express");

const AdminRouter=express.Router()
const {approveDoctor, toggleUserStatus, getAllUsers,importDoctorsFromCSV } = require("../Controllers/Admin.controller");
const jwt=require("jsonwebtoken")
const upload = require("../Middlewares/uploadCSV");
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

// // Thêm tài khoản mới (Doctor hoặc Patient)
// /**
//  * @swagger
//  * /admin/create-user:
//  *   post:
//  *     summary: Thêm mới tài khoản bác sĩ hoặc bệnh nhân
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userType
//  *               - firstName
//  *               - lastName
//  *               - email
//  *               - password
//  *             properties:
//  *               userType:
//  *                 type: string
//  *                 enum: [doctor, patient]
//  *                 example: "doctor"
//  *               firstName:
//  *                 type: string
//  *                 example: "Nguyen"
//  *               lastName:
//  *                 type: string
//  *                 example: "An"
//  *               email:
//  *                 type: string
//  *                 example: "doctor.an@example.com"
//  *               password:
//  *                 type: string
//  *                 example: "123456"
//  *               specialty:
//  *                 type: string
//  *                 example: "Cardiology"
//  *               clinicLocation:
//  *                 type: string
//  *                 example: "Hanoi General Hospital"
//  *               contactNumber:
//  *                 type: string
//  *                 example: "0905123456"
//  *               licenseCode:
//  *                 type: string
//  *                 example: "LIC12345"
//  *               bloodGroup:
//  *                 type: string
//  *                 example: "O+"
//  *               dateOfBirth:
//  *                 type: string
//  *                 format: date
//  *                 example: "1999-02-15"
//  *               gender:
//  *                 type: string
//  *                 enum: [male, female, other]
//  *                 example: "male"
//  *               address:
//  *                 type: string
//  *                 example: "123 Nguyen Trai, Hanoi"
//  *               city:
//  *                 type: string
//  *                 example: "Hanoi"
//  *     responses:
//  *       201:
//  *         description: Tạo tài khoản thành công
//  *       400:
//  *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
//  *       500:
//  *         description: Lỗi máy chủ
//  */
// AdminRouter.post("/create-user", Auth, AdminAuth, createUserAccount);

// // Thống kê
// /**
//  * @swagger
//  * /admin/stats:
//  *   get:
//  *     summary: Lấy thống kê tổng quan hệ thống
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Dữ liệu thống kê hệ thống
//  *       500:
//  *         description: Lỗi khi lấy thống kê
//  */
// AdminRouter.get("/stats",Auth, AdminAuth, getSystemStats);

// // Xuất báo cáo
// /**
//  * @swagger
//  * /admin/export-report:
//  *   get:
//  *     summary: Xuất báo cáo hoạt động hệ thống
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: from
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Ngày bắt đầu lọc dữ liệu (yyyy-mm-dd)
//  *         example: 2024-01-01
//  *       - in: query
//  *         name: to
//  *         schema:
//  *           type: string
//  *           format: date
//  *         description: Ngày kết thúc lọc dữ liệu (yyyy-mm-dd)
//  *         example: 2024-12-31
//  *     responses:
//  *       200:
//  *         description: Báo cáo được xuất thành công
//  */
// AdminRouter.get("/export-report",Auth, AdminAuth, exportReport);

// // Xem log
// /**
//  * @swagger
//  * /admin/logs:
//  *   get:
//  *     summary: Xem log hoạt động của quản trị viên
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Danh sách log hoạt động
//  */
// AdminRouter.get("/logs",Auth, AdminAuth, viewAdminLogs);

/**
 * @swagger
 * /admin/allusers:
 *   get:
 *     summary: "Lấy danh sách tất cả người dùng (bác sĩ và bệnh nhân)"
 *     description: "API này cho phép admin lấy danh sách người dùng, có thể lọc theo loại tài khoản (doctor/patient), contact (email/sđt), trạng thái, phân trang và sắp xếp."
 *     tags: ["Admin"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["doctor", "patient"]
 *         description: "Loại tài khoản cần lọc (doctor hoặc patient). Nếu không có sẽ trả về cả hai."
 *       - in: query
 *         name: contact
 *         schema:
 *           type: string
 *         description: "Tìm kiếm theo email hoặc số điện thoại."
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           example: 1
 *         description: "Trạng thái tài khoản (1 = hoạt động, 0 = bị khóa hoặc chưa kích hoạt)."
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Trang hiện tại (phân trang)."
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Số lượng người dùng mỗi trang."
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: "Thứ tự sắp xếp theo ngày tạo."
 *     responses:
 *       200:
 *         description: "Danh sách người dùng trả về thành công."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Vũ Huỳnh"
 *                       email:
 *                         type: string
 *                         example: "huynhdoctor@gmail.com"
 *                       contactNumber:
 *                         type: string
 *                         example: "0562143165"
 *                       status:
 *                         type: integer
 *                         example: 1
 *                       userType:
 *                         type: string
 *                         enum: ["doctor", "patient"]
 *                       specialty:
 *                         type: string
 *                         nullable: true
 *                         example: "Phụ khoa"
 *                       clinicLocation:
 *                         type: string
 *                         nullable: true
 *                         example: "Trạm y tế xã Cẩm Giàng"
 *                       profile:
 *                         type: string
 *                         nullable: true
 *                         example: "https://images.pexels.com/photo.jpg"
 *                       about:
 *                         type: string
 *                         nullable: true
 *                         example: "Một bác sĩ yêu nghề"
 *                       dateOfBirth:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "1999-09-15"
 *                       gender:
 *                         type: string
 *                         nullable: true
 *                         example: "female"
 *                       bloodGroup:
 *                         type: string
 *                         nullable: true
 *                         example: "O+"
 *                       address:
 *                         type: string
 *                         nullable: true
 *                         example: "Hai Duong, Cam Hung"
 *                       city:
 *                         type: string
 *                         nullable: true
 *                         example: "Hai Duong"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-12T13:36:23.515Z"
 *       500:
 *         description: "Lỗi hệ thống."
 */
AdminRouter.get("/allusers",Auth, AdminAuth, getAllUsers);


/**
 * @swagger
 * /admin/doctors/import-csv:
 *   post:
 *     summary: Nhập danh sách bác sĩ từ file CSV
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *           description: File CSV chứa danh sách bác sĩ
 *     responses:
 *       200:
 *         description: Nhập danh sách bác sĩ thành công
 *       400:
 *         description: Lỗi định dạng file hoặc dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */


AdminRouter.post("/doctors/import-csv",Auth, AdminAuth, upload.single("file"), importDoctorsFromCSV);


module.exports = AdminRouter