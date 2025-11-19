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

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [editedStatus, setEditedStatus] = useState({});
  const token = localStorage.getItem("token");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log("appointments", appointments, token);
  // console.log("appointments", appointments);

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
      console.error("Error fetching doctor appointments:", error);
    }
  };

  // useEffect(() => {
  //   const doctorId = localStorage.getItem("userId");

  //   if (doctorId) {
  //     axios
  //       .get(
  //         `http://localhost:8080/appointments/doctor/${doctorId}`,
  //         {
  //           role: "docotor",
  //           headers: {
  //             Authorization: `Bearer ${token}`
  //           }
  //         }
  //       )
  //       .then((response) => {
  //         const data = response.data;
  //         console.log("response", data);
  //         // setDoctor(data.appointment[0].doctor);
  //         setAppointments(data);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching doctor data:", error);
  //       });
  //   }
  // }, [token]);

  // useEffect(() => {
  //   const doctorId = localStorage.getItem("userId");
  //   // console.log("doctorId: ", doctorId, token);
  //   if (doctorId) {
  //     axios
  //       .get(
  //         `http://localhost:8080/doctors/${doctorId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`
  //           }
  //         }
  //       )
  //       .then((response) => {
  //         const data = response.data;
  //         console.log("response", data);
  //         setDoctor(data);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching doctor data:", error);
  //       });
  //   }
  // }, [token]);

  // Lấy thông tin bác sĩ
  
 useEffect(() => {
  const doctorId = localStorage.getItem("userId");
  if (!doctorId) return;

  axios
    .get(`http://localhost:8080/doctors/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      // Sửa lại để truy cập đúng vào res.data.doctor
      setDoctor(res.data.doctor || res.data);
      console.log("Doctor data loaded:", res.data);
    })
    .catch((err) => console.error("Error fetching doctor data:", err));

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
      console.log("Appointment added — refreshing data...");
      fetchAppointments(doctorId);
    });

    socket.on("appointmentUpdated", () => {
      console.log("Appointment updated — refreshing data...");
      fetchAppointments(doctorId);
    });

    socket.on("appointmentDeleted", () => {
      console.log("Appointment deleted — refreshing data...");
      fetchAppointments(doctorId);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAppointments]);

  const updateDoctorDetail = async (field, value) => {
    // console.log("Doctorid", doctor.appointmentId);
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
        toast.success(`Successfully updated ${field}`);
      } else {
        console.error("Failed to update patient detail");
      }
    } catch (error) {
      console.error("Error updating patient detail:", error);
      toast.error(`Error updating ${field}`);
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
    console.log("requestBody", requestBody);
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
        toast.success("Appointment status updated successfully");
      } else {
        console.error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error updating appointment status");
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
        toast.success("Appointment deleted successfully");
      } else {
        console.error("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error deleting appointment");
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
        <div className="container mx-auto py-8 mt-12 w-[95%]">
          <div className="border border-gray-300 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1 flex items-center">
                {doctor ? (
                  <div>
                    <h2 className="text-3xl font-semibold mb-2 text-blue-600">
                      <i className="pi pi-user mr-2 text-4xl"></i>
                      {doctor.firstName} {doctor.lastName}
                    </h2>
                    {/* Edit icon and logic for First Name */}
                    {editingField === "firstName" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("firstName", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i
                          className="pi pi-user text-blue-600 mr-2 text-xl"
                        />
                        <p className="text-lg text-gray-600">First Name:</p>
                        <p className="text-lg ml-2">{doctor.firstName}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("firstName");
                            setEditedValue(doctor.firstName);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}
                    {/* Last Name */}
                    {editingField === "lastName" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("lastName", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-user mr-2 text-xl text-blue-600"></i>
                        <p className="text-lg text-gray-600">Last Name:</p>
                        <p className="text-lg ml-2">{doctor.lastName}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("lastName");
                            setEditedValue(doctor.lastName);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}
                    {/* Edit icon and logic for Specialty */}
                    {editingField === "specialty" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("specialty", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        {/* Display the doctor's specialty */}
                        <i className=" text-blue-600 mr-2 w-5 h-5">&#129658;</i>
                        <p className="text-lg text-gray-600">Specialty:</p>
                        <p className="text-lg ml-2">{doctor.specialty}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("specialty");
                            setEditedValue(doctor.specialty);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}
                    {/* Edit icon and logic for Clinic Location */}
                    {editingField === "clinicLocation" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("clinicLocation", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-map-marker text-blue-600 mr-2 w-5 h-5"></i>
                        <p className="text-lg text-gray-600">
                          Clinic Location:
                        </p>
                        <p className="text-lg ml-2">{doctor.clinicLocation}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("clinicLocation");
                            setEditedValue(doctor.clinicLocation);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}

                    {/* Edit icon and logic for Contact Number */}
                    {editingField === "contactNumber" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("contactNumber", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-phone text-blue-600 mr-2 w-5 h-5"></i>
                        <p className="text-lg text-gray-600">Contact Number:</p>
                        <p className="text-lg ml-2">{doctor.contactNumber}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("contactNumber");
                            setEditedValue(doctor.contactNumber);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}

                    {/* Edit icon and logic for Working Hours */}
                    {editingField === "workingHours" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("workingHours", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-clock text-blue-600 mr-2 w-5 h-5"></i>
                        <p className="text-lg text-gray-600">Working Hours:</p>
                        <p className="text-lg ml-2">
                        {doctor.workingHours} hours per day
                        </p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("workingHours");
                            setEditedValue(doctor.workingHours);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}

                    {/* Edit icon and logic for About */}
                    {editingField === "about" ? (
                      <div className="flex items-center mb-4">
                        <textarea
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updateDoctorDetail("about", editedValue)
                          }
                        >
                          <i className="pi pi-save"></i>
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-info-circle text-blue-600 mr-2 w-5 h-5"></i>  
                        <p className="text-lg text-gray-600">About:</p>
                        <p className="text-lg ml-7">{doctor.about}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("about");
                            setEditedValue(doctor.about);
                          }}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg">Loading doctor data...</p>
                )}
              </div>

              <div className="md:col-span-1">
                <div className="w-96 h-96 mx-auto relative rounded-full overflow-hidden">
                  <img
                    src={doctor ? doctor.profile : ""}
                    alt={doctor ? `${doctor.firstName} ${doctor.lastName}` : ""}
                    className="w-96 h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-lg font-semibold">
                      View Profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-gray-300 p-6 rounded-lg mt-8">
            <h2 className="text-3xl font-semibold mt-8 text-blue-600">
              <i className="pi pi-user-plus mr-2 text-4xl"></i>
              Appointments
            </h2>
            <p className="text-lg text-gray-600">
              Total Appointments: {appointments.length}
            </p>
          </div>

          <hr className="my-6 border-t border-gray-300" />
          <h2 className="text-3xl font-semibold mt-8 text-blue-600">
            <i className="pi pi-info-circle mr-2 text-blue-600 text-4xl" />
            About Dr. {doctor ? doctor.firstName : "Loading..."}{" "}
            {doctor ? doctor.lastName : "Loading..."}
          </h2>
          {doctor ? (
            <>
            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Bác sĩ {doctor.firstName} {doctor.lastName} là một chuyên gia y tế dày dặn kinh nghiệm và được đánh giá rất cao trong lĩnh vực {doctor.specialty}. 
              Với kinh nghiệm sâu rộng trong {doctor.specialty}, bác sĩ {doctor.lastName} đã xây dựng được danh tiếng về sự tận tâm, chuyên nghiệp và hết lòng vì sức khỏe của bệnh nhân. 
              Tốt nghiệp với thành tích xuất sắc từ một cơ sở đào tạo y khoa uy tín, bác sĩ {doctor.lastName} luôn mang đến kiến thức và kỹ năng vững vàng trong mọi lần thăm khám.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Hành trình chăm sóc sức khỏe bắt đầu tại {doctor.clinicLocation}, nơi bác sĩ {doctor.lastName} vận hành một phòng khám hiện đại và được trang bị đầy đủ. 
              Bệnh nhân hoàn toàn có thể tin tưởng vào chuyên môn và sự tận tâm của bác sĩ {doctor.lastName} cùng đội ngũ hỗ trợ chuyên nghiệp.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Bác sĩ {doctor.lastName} luôn coi trọng tính kết nối và sự thuận tiện cho bệnh nhân, vì vậy bạn có thể dễ dàng liên hệ qua số điện thoại {doctor.contactNumber}. 
              Dù bạn muốn đặt lịch hay cần tư vấn y khoa, bác sĩ {doctor.lastName} luôn sẵn sàng hỗ trợ.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Với sự cam kết vì sức khỏe cộng đồng, bác sĩ {doctor.lastName} dành {doctor.workingHours} giờ mỗi ngày để chăm sóc bệnh nhân, đảm bảo mọi mối lo ngại về sức khỏe đều được giải quyết chu đáo. 
              Sự tận tâm đó còn được thể hiện qua các phác đồ điều trị cá nhân hóa, phù hợp với nhu cầu của từng bệnh nhân.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Ngoài công việc tại phòng khám, bác sĩ {doctor.lastName} còn tích cực tham gia các chương trình giáo dục và nâng cao nhận thức sức khỏe cho cộng đồng, thể hiện niềm đam mê cải thiện sức khỏe cộng đồng. 
              Bệnh nhân không chỉ nhận được sự chăm sóc chuyên môn mà còn được bác sĩ {doctor.lastName} hướng dẫn về các biện pháp phòng bệnh hiệu quả.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Bác sĩ {doctor.lastName} tự hào xây dựng một môi trường thân thiện và cởi mở dành cho mọi bệnh nhân, đảm bảo ai cũng cảm thấy thoải mái và được tôn trọng trong suốt quá trình thăm khám. 
              Bệnh nhân luôn đánh giá cao thái độ tận tâm và khả năng giải thích các khái niệm y khoa phức tạp một cách dễ hiểu của bác sĩ {doctor.lastName}.
            </p>

            <p className="text-lg border border-gray-300 p-6 rounded-lg mt-4">
              Nếu bạn đang tìm kiếm một bác sĩ kết hợp giữa chuyên môn, sự thấu hiểu và tinh thần cống hiến, bác sĩ {doctor.lastName} sẽ là lựa chọn lý tưởng. 
              Sức khỏe và sự an tâm của bạn luôn được đặt lên hàng đầu, và bác sĩ {doctor.lastName} sẽ đồng hành cùng bạn trên hành trình hướng tới cuộc sống khỏe mạnh hơn. 
              Hãy trải nghiệm sự khác biệt trong mô hình chăm sóc lấy bệnh nhân làm trung tâm với bác sĩ {doctor.firstName} {doctor.lastName}. 
              Đặt lịch hẹn ngay hôm nay để bắt đầu hành trình hướng đến một cuộc sống tốt đẹp hơn dưới sự chăm sóc của một chuyên gia y tế đáng tin cậy.
            </p>
            </>
          ) : null}

          {appointments.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-3xl font-semibold mb-4 text-blue-600">
                <i className="pi pi-user-plus mr-2 text-blue-600 text-4xl"></i>
                Upcoming Appointments
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
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
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
                              {appointment.status}
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

export default DoctorProfile;
