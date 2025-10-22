import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/Patient/DoctorCard";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";
const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // console.log("Token:", token);
  const { logout } = useContext(AuthContext);

    const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:8080/doctors/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.doctors) {
        setDoctors(response.data.doctors.reverse());
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchTotalAppointments = async () => {
    const patientId = localStorage.getItem("userId");
    try {
      if (patientId) {
        const response = await axios.get(
          `http://localhost:8080/appointments/patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = response.data;
        //  console.log(data);
        setTotalAppointments(data.length);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchTotalAppointments();
  }, [token]);

  // Thêm WebSocket realtime
  useEffect(() => {
    const patientId = localStorage.getItem("userId");
    if (!patientId) return;

    const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.emit("joinRoom", `patient_${patientId}`);
    console.log(`Joined room: patient_${patientId}`);

    // Lắng nghe các sự kiện realtime
    const refresh = () => {
      console.log("Appointment changed — updating total...");
      fetchTotalAppointments();
    };

    socket.on("appointmentAdded", refresh);
    socket.on("appointmentUpdated", refresh);
    socket.on("appointmentDeleted", refresh);

    return () => {
      socket.disconnect();
      console.log("Socket disconnected (PatientDashboard)");
    };
  }, []);

  const breadcrumbs = [{ title: "Home", link: "/patient-dashboard" }];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="bg-blue-600 text-white py-4 fixed top-0 w-full z-10 flex justify-between items-center">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-semibold">
            <i className="pi pi-user-md mr-2 text-4xl" />
            Doctor Directory
          </h1>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-full focus:outline-none focus:shadow-outline-red active:bg-red-800 transform hover:scale-105 transition-transform duration-300 ease-in-out mr-4 flex"
          onClick={handleLogout}
        >
          <i className="pi pi-sign-out mr-2 mt-1" />
          <h1>Logout</h1>
        </button>
      </header>

      <div className="container mx-auto max-w-screen-xl p-8 mt-12">
        <div className="mt-18 text-right flex items-center justify-end space-x-2 relative sm:mt-26 md:mt-26">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline-indigo active:bg-indigo-800 transform hover:scale-105 transition-transform duration-300 ease-in-out "
            onClick={() => {
              navigate("/myappointment");
            }}
          >
            <i className="pi pi-calendar-plus mr-2" />
            My Appointment
            {totalAppointments > 0 && (
              <div className="absolute top-0 right-0  text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center -mt-2 -mr-2 p-3 text-sm border-2 z-10 bg-white border-indigo-700">
                {totalAppointments}
              </div>
            )}
          </button>
        </div>
        <Breadcrumb items={breadcrumbs} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.doctorId} doctor={doctor} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PatientDashboard;
