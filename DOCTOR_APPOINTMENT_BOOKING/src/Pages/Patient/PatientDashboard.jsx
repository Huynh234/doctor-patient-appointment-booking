import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../../components/Patient/DoctorCard";
import Breadcrumb from "../../components/Breadcrumb";
import Footer from "../../components/Footer";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";
import { TabMenu } from 'primereact/tabmenu';
import newLogo from '../../assets/Logo_Medbooking.png';
import { Button } from 'primereact/button';
import IntroDashBoard from "../../Pages/Patient/IntroDashBoard";
import MyAppointments from "../../Pages/Patient/MyAppointment";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from 'primereact/multiselect';
import { Paginator } from 'primereact/paginator';

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [datadm, setdatadm] = useState(null);
  const dataSpecialty = [
    { code: 'Đa khoa', name: "dm" }, { code: 'Tim mạch', name: "dm" }, { code: 'Ngoại khoa', name: "dm" }, { code: 'Nội khoa', name: "dm" }, { code: 'Da liễu', name: "dm" }, { code: 'Mắt', name: "dm" }, { code: 'Khoa nhi', name: "dm" }, { code: 'Răng hàm mặt', name: "dm" }, { code: 'Sản phụ khoa', name: "dm" }, { code: 'Thần kinh', name: "dm" }, { code: 'Tai mũi họng', name: "dm" }, { code: 'Tâm thần', name: "dm" }, { code: 'Phục hồi chức năng', name: "dm" }
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  // console.log("Token:", token);
  const { logout } = useContext(AuthContext);
  const [searchText, setSearchText] = useState("");
  const items = [
    { label: 'Giới thiệu', icon: 'pi pi-home' },
    { label: 'Đặt lịch khám', icon: 'pi pi-calendar-clock' },
    { label: 'Xem lịch khám', icon: 'pi pi-list' }
  ];

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(6);
  const [totalRecord, setTotalRecords] = useState(0);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchDoctors();
  };

  useEffect(() => {
    fetchDoctors();
  }, [first, rows]);


  const fetchDoctors = async (keyword = "", specialties = "") => {
    try {
      const response = await axios.get("http://localhost:8080/doctors/all", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          dn: keyword || undefined,
          dm: specialties || undefined,
          page: first / rows,  // tính trang
          limit: rows
        },
      });

      if (response.data.data) {
        setDoctors(response.data.data);
        setTotalRecords(response.data.total); // nhớ set thêm
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

  const breadcrumbs = [{ title: "Danh sách bác sĩ", link: "/patient-dashboard" }];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="card bg-white fixed top-0 w-full z-10 flex justify-between items-center box-border shadow-md">
        <div className="flex w-full">
          <div className="flex ml-8 items-center justify-start cursor-pointer" onClick={() => {navigate("/patient-dashboard"); setActiveIndex(0);}}>
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
            <div className="overflow-auto lg:flex gap-10 mb-4 border box-border shadow-sm rounded-sm p-4 justify-center items-center" >
              <div className="flex-1">
                <div>
                  <label className="block mb-2 text-lg font-medium text-gray-900">
                    Tìm kiếm bác sĩ
                  </label>
                  <InputText className="w-full" id="search" placeholder="Nhập tên bác sĩ" value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      fetchDoctors(e.target.value, datadm?.join(","));
                    }} />
                </div>
              </div>
              <div className="flex-1">
                <div>
                  <label className="block mb-2 text-lg font-medium text-gray-900">
                    Chuyên Khoa
                  </label>
                  <MultiSelect value={datadm} options={dataSpecialty} optionLabel="code" optionValue="code" display="chip"
                    placeholder="Chọn chuyên khoa" maxSelectedLabels={3} className="w-full md:w-20rem" onChange={(e) => {
                      setdatadm(e.value);
                      fetchDoctors(searchText, e.value?.join(","));
                    }} />
                </div>
              </div>
              <div className="flex-0">
                <div>
                  <p className="block mb-2 text-lg font-medium text-gray-900">
                    Xóa bộ lọc
                  </p>
                  <Button label="Reset" icon="pi pi-refresh" className="p-button-primary" onClick={() => {
                    setSearchText("");
                    setdatadm(null);
                    setFirst(0);
                    setRows(6);
                  }} />
                </div>
              </div>
            </div>
            <div>
              <div className="card h-[68rem] overflow-hidden overflow-y-auto overflow-x-auto">
                <Breadcrumb items={breadcrumbs} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.doctorId} doctor={doctor} />
                  ))}
                </div>
              </div>
              <div className="card">
                <Paginator first={first} rows={rows} totalRecords={totalRecord} rowsPerPageOptions={6} onPageChange={onPageChange} />
              </div>
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
