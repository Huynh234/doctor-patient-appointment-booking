//index.js
const http = require('http');
const express=require('express');
const sequelize = require("./Config/data");
const DoctorRouter = require('./Routes/Doctor.route');
const swaggerDocs = require("./Config/swagger"); 
const PatientRouter = require('./Routes/Patient.route');
const AppointmentRouter = require('./Routes/Appointment.route');
const AdminRouter = require('./Routes/Admin.route');
const SendMailRouter = require('./Routes/SendMail.route');

require("dotenv").config()
require("./Models/Patient.model");
require("./Models/Doctor.model");
require("./Models/Appointment.model");
require("./Models/EmailNotification.model");

const app=express();
const cors=require('cors')
const { Server } = require("socket.io");

app.use(cors())
app.use(express.json())
swaggerDocs(app);

// Tạo HTTP server để gắn socket.io vào
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// --- Global Socket.IO handler ---
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Cho phép user join vào phòng riêng (VD: doctor_1 hoặc patient_5)
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Truyền io vào request để controller có thể emit sự kiện realtime
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/",(req,res)=>{    
    res.send("Doctors Appoinment Backend")
})
app.use("/doctors",DoctorRouter)
app.use("/patients",PatientRouter)
app.use("/appointments",AppointmentRouter)
app.use("/admin",AdminRouter)
app.use("/send-mail", SendMailRouter);

// Start server + sync database
const PORT = process.env.PORT || 8080;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to SQL Server");
    await sequelize.sync(); 
    console.log("All models synchronized");

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
})();
