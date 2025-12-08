import React, { useContext, useEffect, useState } from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/Footer";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const statusColors = {
  scheduled: "text-blue-500 ",
  completed: "text-green-500 ",
  canceled: "text-red-500 "
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [editedStatus, setEditedStatus] = useState({});
  const token = localStorage.getItem("token");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

    // Hàm load danh sách lịch hẹn của bác sĩ
  const fetchAppointments = async (doctorId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/appointments/doctor/${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn của bác sĩ:", error);
    }
  };

  // Lấy thông tin bác sĩ
  useEffect(() => {
    const doctorId = localStorage.getItem("userId");
    if (!doctorId) return;

    axios
      .get(`http://localhost:8080/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setDoctor(res.data))
      .catch((err) => console.error("Lỗi khi lấy thông tin bác sĩ:", err));

    // Gọi lần đầu load lịch hẹn
    fetchAppointments(doctorId);
  }, [token]);

   // Thiết lập Socket.IO realtime
  useEffect(() => {
    const doctorId = localStorage.getItem("userId");
    if (!doctorId) return;

    // Kết nối socket
    const socket = io("http://localhost:8080", {
      transports: ["websocket"]
    });

    // Join vào phòng riêng của bác sĩ
    socket.emit("joinRoom", `doctor_${doctorId}`);
    console.log("Joined room: doctor_" + doctorId);

    // Khi có thay đổi lịch hẹn
    socket.on("appointmentAdded", () => {
      console.log("Lịch hẹn đã được thêm — đang làm mới dữ liệu...");
      fetchAppointments(doctorId);
    });

    socket.on("appointmentUpdated", () => {
      console.log("Lịch hẹn đã được cập nhật — đang làm mới dữ liệu...");
      fetchAppointments(doctorId);
    });

    socket.on("appointmentDeleted", () => {
      console.log("Lịch hẹn đã được xóa — đang làm mới dữ liệu...");
      fetchAppointments(doctorId);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAppointments]);

  const updateDoctorDetail = async (field, value) => {
    // console.log("Doctorid", doctor._id);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    // console.log("token userId", token, userId);
    const requestBody = {
      [field]: value,
      role: "doctor"
    };
    try {
      const response = await axios.patch(
        `http://localhost:8080/doctors/${userId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedDoctor = { ...doctor, [field]: value };
        setDoctor(updatedDoctor);
        setEditingField(null);
        toast.success(`Cập nhật ${field} thành công`);
      } else {
        console.error("Thất bại khi cập nhật thông tin bác sĩ");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin bác sĩ:", error);
      toast.error(`Lỗi khi cập nhật ${field}`);
    }
  };

  const updateEditedStatus = (appointmentId, status) => {
    setEditedStatus((prevState) => ({
      ...prevState,
      [appointmentId]: status
    }));
  };

  const handleStatusChange = (event, appointment) => {
    const newStatus = event.target.value;
    updateEditedStatus(appointment.appointmentId, newStatus);
  };

  const saveEditedStatus = async (appointmentId) => {
    const newStatus = editedStatus[appointmentId];
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    // console.log("token userId", token, userId);
    const requestBody = {
      status: newStatus,
      role: "doctor"
    };
    try {
      const response = await axios.patch(
        `http://localhost:8080/appointments/${appointmentId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedAppointments = appointments.map((appointment) =>
          appointment.appointmentId === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        );
        setAppointments(updatedAppointments);
        toast.success("Cập nhật trạng thái lịch hẹn thành công");
      } else {
        console.error("Thất bại khi cập nhật trạng thái lịch hẹn");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái lịch hẹn:", error);
      toast.error("Lỗi khi cập nhật trạng thái lịch hẹn");
    }
  };

  const deleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    // console.log("token", token);
    try {
      const response = await axios.delete(
        `http://localhost:8080/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedAppointments = appointments.filter(
          (appointment) => appointment.appointmentId !== appointmentId
        );
        setAppointments(updatedAppointments);
        toast.success("Xóa lịch hẹn thành công");

      } else {
        console.error("Thất bại khi xóa lịch hẹn");
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch hẹn:", error);
      toast.error("Lỗi khi xóa lịch hẹn");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // console.log("A", appointments.length);
  return (
    <>
      <div className="bg-gray-100 min-h-screen font-sans">
        <ToastContainer position="top-right" autoClose={3000} />{" "}
        <div className="container mx-auto p-6">
          <div className="border border-gray-300 p-6 rounded-lg mt-8">
            <h2 className="text-3xl font-semibold mt-8 text-blue-600">
              <i className="pi pi-user-plus mr-2 text-4xl"></i>
              Lịch hẹn
            </h2>
            <p className="text-lg text-gray-600">
              Tổng số lịch hẹn: {appointments.length}
            </p>
          </div>

          <hr className="my-6 border-t border-gray-300" />
          <h2 className="text-3xl font-semibold mt-8 text-blue-600">
            <i className="pi pi-info-circle mr-2 text-blue-600 text-4xl" />
            Thông tin Bs. {appointments[0]?.Doctor ? appointments[0].Doctor.firstName : "Loading..."}{" "}
            {appointments[0]?.Doctor ? appointments[0].Doctor.lastName : "Loading..."}
          </h2>

          {appointments.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-3xl font-semibold mb-4 text-blue-600">
                <i className="pi pi-user-plus mr-2 text-blue-600 text-4xl"></i>
                Danh sách lịch hẹn
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-gray-800 border-collapse rounded-lg overflow-hidden text-center">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
                      <th className="px-6 py-4 text-lg">Patient</th>
                      <th className="px-6 py-4 text-lg">Date</th>
                      <th className="px-6 py-4 text-lg">Time</th>
                      <th className="px-6 py-4 text-lg">Disease</th>
                      <th className="px-6 py-4 text-lg">Status</th>
                      <th className="px-6 py-4 text-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr
                        key={appointment.appointmentId}
                        className={`group transition-all hover:bg-blue-200 ${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-lg">{`${appointment.Patient.firstName} ${appointment.Patient.lastName}`}</td>
                        <td className="px-6 py-4 text-lg">
                          {appointment.appointmentDate}
                        </td>
                        <td className="px-6 py-4 text-lg">{`${appointment.startTime} - ${appointment.endTime}`}</td>
                        <td className="px-6 py-4 text-lg group-hover:overflow-visible relative">
                          <span className="">{appointment.disease}</span>
                          <div className="hidden absolute bg-white border border-gray-300 p-4 top-10 left-0 w-60 shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-2 transition-all">
                            <p className="text-sm font-normal text-gray-600">
                              {appointment.additionalInfo}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-lg">
                          {editingField === appointment.appointmentId ? (
                            <div className="flex items-center">
                              <select
                                value={
                                  editedStatus[appointment.appointmentId] ||
                                  appointment.status
                                }
                                onChange={(event) =>
                                  handleStatusChange(event, appointment)
                                }
                                className="mr-2"
                              >
                                <option value="scheduled">Đã lên lịch</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="canceled">Đã hủy</option>
                              </select>
                              <button
                                className="text-blue-600"
                                onClick={() => {
                                  saveEditedStatus(appointment.appointmentId);
                                  setEditingField(null);
                                }}
                              >
                                <i className="pi pi-save"></i>
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`px-4 py-2 text-lg ${
                                statusColors[appointment.status]
                              }`}
                            >
                              {appointment.status === "scheduled"
                                ? "Đã lên lịch"
                                : appointment.status === "completed"
                                ? "Hoàn thành"
                                : "Đã hủy"}
                              <span className="mr-2 ml-3">
                                {appointment.status === "scheduled" && (
                                  <i className="pi pi-clock"></i>
                                )}
                                {appointment.status === "completed" && (
                                  <i className="pi pi-check-circle"></i>
                                )}
                                {appointment.status === "canceled" && (
                                  <i className="pi pi-ban"></i>
                                )}
                              </span>
                              <button
                                className={`${
                                  statusColors[appointment.status]
                                } ml-2 text-sm`}
                                onClick={() => {
                                  setEditingField(appointment.appointmentId);
                                  setEditedStatus({
                                    ...editedStatus,
                                    [appointment.appointmentId]: appointment.status
                                  });
                                }}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-lg">
                          <button
                            className="text-red-600 ml-2"
                            onClick={() => deleteAppointment(appointment.appointmentId)}
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;