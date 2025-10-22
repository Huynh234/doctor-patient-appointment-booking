const express=require("express");

const AdminRouter=express.Router()

const jwt=require("jsonwebtoken")
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
module.exports=AdminRouter