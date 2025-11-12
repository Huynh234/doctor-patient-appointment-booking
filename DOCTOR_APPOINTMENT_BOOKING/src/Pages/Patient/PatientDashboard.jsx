import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/Patient/DoctorCard";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";
import { TabMenu } from 'primereact/tabmenu';
import newLogo from '../../assets/newLogo.svg';
import { Button } from 'primereact/button';
import IntroDashBoard from "../../Pages/Patient/IntroDashBoard";
import MyAppointments from "../../Pages/Patient/MyAppointment";
const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeIndex, setActiveIndex] = useState(0);
  // console.log("Token:", token);
  const { logout } = useContext(AuthContext);

  const items = [
    { label: 'Giới thiệu', icon: 'pi pi-home' },
    { label: 'Đặt lịch khám', icon: 'pi pi-calendar-clock' },
    { label: 'Xem lịch khám', icon: 'pi pi-list' }
  ];

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
      <header className="card bg-white fixed top-0 w-full z-10 flex justify-between items-center box-border shadow-md">
        <div className="flex w-full">
          <div className="flex ml-8 items-center justify-start">
            <div><img src={newLogo} alt="Logo" className="mx-auto md:w-16 lg:w-20" /></div>
            <div className="flex flex-col ml-7 text-left">
              <div className=""><p className="md:text-xl lg:text-3xl text-blue-500 font-bold">MedBooking</p></div>
              <div>
                <span className="text-gray-600 md:text-sm lg:text-base">Hệ thống đặt lịch khám trực tuyến</span>
              </div>
            </div>
          </div>
          <div className="lg:flex-1"></div>
          <div className="flex bottom-0 justify-end items-center mr-8">
            <div className="h-full flex items-end">
              <TabMenu model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="lg:text-base md:text-sm" />
            </div>
          <button
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-full focus:outline-none focus:shadow-outline-red active:bg-red-800 transform hover:scale-105 transition-transform duration-300 ease-in-out mr-4 flex"
              onClick={handleLogout}
            >
              <i className="pi pi-sign-out mr-2 mt-1" />
              <h1>Logout</h1>
            </button>
          </div>
        </div>

      </header>

      <main className="mt-24">
        {/* Tab 0: Giới thiệu */}
        {activeIndex === 0 && (
          <IntroDashBoard />
        )}

        {/* Tab 1: Đặt lịch khám */}
        {activeIndex === 1 && (
          <div className="container mx-auto max-w-screen-xl p-8 mt-12">
            <Breadcrumb items={breadcrumbs} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.doctorId} doctor={doctor} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Xem lịch khám */}
        {activeIndex === 2 && (
          <MyAppointments />
        )}
      </main>

      <Footer />
    </>
  );
};

export default PatientDashboard;
