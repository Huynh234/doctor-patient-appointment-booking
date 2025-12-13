import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditAppointmentModal from "../../components/Patient/EditAppointmentModal";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";

const statusColors = {
  scheduled: "text-blue-500",
  completed: "text-green-500",
  canceled: "text-red-500"
};

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const patientId = localStorage.getItem("userId");

  const fetchAppointments = async () => {
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
        // console.log("response", data);
        setAppointments(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch hẹn:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  useEffect(() => {
    const patientId = localStorage.getItem("userId");
    if (!patientId) return;

    const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.emit("joinRoom", `patient_${patientId}`);
    // console.log(`Đã tham gia phòng: patient_${patientId}`);

    const refreshAppointments = (data) => {
      toast.success("Lịch hẹn đã thay đổi — đang làm mới danh sách...");
      fetchAppointments();
    };

    socket.on("appointmentAdded", refreshAppointments);
    socket.on("appointmentUpdated", refreshAppointments);
    socket.on("appointmentDeleted", refreshAppointments);
    // socket.on("statusUpdated", refreshAppointments); // Thêm listener cho status update
    
    return () => {
      socket.disconnect();
      // console.log("Socket đã ngắt kết nối (MyAppointment)");
    };
  }, []);

  const openEditModal = (appointment) => {
    setEditAppointmentData(appointment);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const updateAppointmentData = async (updatedData) => {
    const token = localStorage.getItem("token");
    const requestBody = {
      updatedData,
      role: "patient"
    };
    try {
      const response = await axios.patch(
        `http://localhost:8080/appointments/${editAppointmentData?.appointmentId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedAppointments = appointments.map((appointment) =>
          appointment?.appointmentId === editAppointmentData?.appointmentId
            ? { ...appointment, ...updatedData }
            : appointment
        );
        setAppointments(updatedAppointments);
        setEditModalOpen(false);
        toast.success("Cập nhật lịch hẹn thành công!");
      } else {
        console.error("Không thể cập nhật lịch hẹn");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch hẹn:", error);
      toast.error("Lỗi khi cập nhật lịch hẹn!");
    }
  };

  const deleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
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
          (appointment) => appointment?.appointmentId !== appointmentId
        );
        setAppointments(updatedAppointments);
        toast.success("Xóa lịch hẹn thành công");
      } else {
        console.error("Không thể xóa lịch hẹn");
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch hẹn:", error);
      toast.error("Lỗi khi xóa lịch hẹn");
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
    updateEditedStatus(appointment?.appointmentId, newStatus);
  };

  const saveEditedStatus = async (appointmentId) => {
    const newStatus = editedStatus[appointmentId];
    const token = localStorage.getItem("token");
    const requestBody = {
      status: newStatus,
      role: "patient"
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
          appointment?.appointmentId === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        );
        setAppointments(updatedAppointments);
        toast.success("Cập nhật trạng thái lịch hẹn thành công");
      } else {
        console.error("Không thể cập nhật trạng thái lịch hẹn");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái lịch hẹn:", error);
      toast.error("Lỗi khi cập nhật trạng thái lịch hẹn");
    }
  };

  // Format time to 24h format (giống AppointmentForm)
  function formatTime24h(time) {
    // time format: "HH:mm:ss" or "HH:mm"
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto py-8 mt-12 w-[95%]">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-semibold text-blue-600">
            <i className="pi pi-calendar-plus mr-2 text-4xl" />
            Lịch Hẹn Của Tôi
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Tổng số lịch hẹn: {appointments.length}
          </p>
        </div>

        <div className="mt-8">
          {appointments.length > 0 ? (
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-blue-600">
                <i className="pi pi-calendar-plus mr-2 text-blue-600 text-4xl" />
                Danh Sách Lịch Hẹn
              </h2>
              <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
                <table className="min-w-full text-gray-800 border-collapse rounded-lg overflow-hidden text-center">
                  <thead>
                    <tr className="bg-blue-500 text-white text-center">
                      <th className="px-6 py-4 text-lg">Bác Sĩ</th>
                      <th className="px-6 py-4 text-lg">Ngày</th>
                      <th className="px-6 py-4 text-lg">Thời Gian</th>
                      <th className="px-6 py-4 text-lg">Bệnh lý</th>
                      <th className="px-6 py-4 text-lg">Trạng Thái</th>
                      <th className="px-6 py-4 text-lg">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr
                        key={appointment.appointmentId}
                        className={`group transition-all hover:bg-indigo-200 ${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-lg">{`${appointment.Doctor.firstName} ${appointment.Doctor.lastName}`}</td>
                        <td className="px-6 py-4 text-lg">
                          {appointment.appointmentDate}
                        </td>
                        <td className="px-6 py-4 text-lg">{`${formatTime24h(
                          appointment.startTime
                        )} - ${formatTime24h(appointment.endTime)}`}</td>

                        <td className="px-6 py-4 text-lg group-hover:overflow-visible relative">
                          <span>{appointment.disease}</span>
                          <div className="hidden absolute bg-white border border-gray-300 p-4 top-10 left-0 w-60 shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-2 transition-all z-10">
                            <p className="text-sm font-normal text-gray-600">
                              {appointment.additionalInfo}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-lg">
                          {editingField === appointment?.appointmentId ? (
                            <div className="flex items-center justify-center">
                              <select
                                value={
                                  editedStatus[appointment?.appointmentId] ||
                                  appointment.status
                                }
                                onChange={(event) =>
                                  handleStatusChange(event, appointment)
                                }
                                className="mr-2 px-2 py-1 border rounded"
                              >
                                <option value="scheduled">Chờ duyệt</option>
                                <option value="completed">Duyệt lịch</option>
                                <option value="canceled">Huỷ lịch</option>
                              </select>
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  saveEditedStatus(appointment?.appointmentId);
                                  setEditingField(null);
                                }}
                              >
                                <i className="pi pi-save" />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`px-4 py-2 text-lg ${
                                statusColors[appointment.status]
                              }`}
                            >
                              {appointment.status === "scheduled"
                                ? "Chờ duyệt"
                                : appointment.status === "completed"
                                ? "Duyệt lịch"
                                : "Huỷ lịch"}
                              <span className="mr-2 ml-3">
                                {appointment.status === "scheduled" && (
                                  <i className="pi pi-clock" />
                                )}
                                {appointment.status === "completed" && (
                                  <i className="pi pi-check-circle" />
                                )}
                                {appointment.status === "canceled" && (
                                  <i className="pi pi-ban" />
                                )}
                              </span>
                              {/* <button
                                className={`${
                                  statusColors[appointment.status]
                                } ml-2 text-sm hover:opacity-70`}
                                onClick={() => {
                                  setEditingField(appointment?.appointmentId);
                                  setEditedStatus({
                                    ...editedStatus,
                                    [appointment?.appointmentId]: appointment.status
                                  });
                                }}
                              >
                                <i className="pi pi-pencil" />
                              </button> */}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-lg">
                          {appointment.status === "scheduled" ? <button
                            className="text-blue-600 ml-2 hover:text-blue-800"
                            onClick={() => openEditModal(appointment)}
                            title="Chỉnh sửa"
                          >
                            <i className="pi pi-pencil" />
                          </button> : null}
                          <button
                            className="text-red-600 ml-2 hover:text-red-800"
                            onClick={() => deleteAppointment(appointment?.appointmentId)}
                            title="Xóa"
                          >
                            <i className="pi pi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <i className="pi pi-calendar-times text-gray-400 text-6xl mb-4" />
              <p className="text-xl text-gray-600">Chưa có lịch hẹn nào</p>
            </div>
          )}
        </div>
        
        {editModalOpen && (
          <EditAppointmentModal
            appointment={editAppointmentData}
            closeModal={closeEditModal}
            updateAppointment={updateAppointmentData}
          />
        )}
      </div>
    </div>
  );
};

export default MyAppointment;