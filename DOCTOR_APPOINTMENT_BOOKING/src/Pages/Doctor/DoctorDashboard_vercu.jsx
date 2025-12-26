import React, { useContext, useEffect, useState, useCallback } from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../../components/Footer";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
const statusColors = {
  scheduled: "text-blue-500 ",
  completed: "text-green-500 ",
  canceled: "text-red-500 "
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const token = localStorage.getItem("token");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [visiable2, setVisiable2] = useState(false);
  const [change, setChange] = useState(false);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  // Hàm load danh sách lịch hẹn của bác sĩ
  const [date, setDate] = useState(new Date());
  const [filterByDate, setFilterByDate] = useState(true);
  const [useAppointment, setUseAppointment] = useState(null);
  const [count, setCount] = useState(1);
  const [payload, setPayload] = useState({
    service: '',
    examFee: '',
    medicines: [
      { name: "", quantity: 1, price: 0 }
    ]
  });

  const resetpayLoad = () => {
    setPayload({
      service: '',
      examFee: '',
      medicines: [
        { name: "", quantity: 1, price: 0 }
      ]
    });
  }
  const fetchAppointments = async (doctorId, selectedDate, useDateFilter) => {
    try {
      let url = `http://localhost:8080/appointments/doctor/${doctorId}`;

      if (useDateFilter && selectedDate) {
        const formattedDate = selectedDate.toLocaleDateString("en-CA");
        url += `?date=${formattedDate}`;
      }
      // console.log("Fetching appointments from URL:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
    }
  };

  const sendMail = (Pa, Do, Ap) => {

    const mailData = {
      form: "Hệ thống đặt lịch trực tuyến",
      receiver: Pa?.email,
      subject: `Bác sỹ ${Do.firstName + " " + Do.lastName} Thông báo: ${topic}`,
      message: message,
      appointmentId: Ap.appointmentId
    };
    try {
      axios.post('http://localhost:8080/send-mail/send', mailData)
        .then((res) => {
          if (res.status === 200) {
            toast.success("Gửi email thành công");
            setVisible(false);
          } else {
            toast.error("Gửi email thất bại");
          }
        })
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      toast.error("Lỗi khi gửi email");
    }
  };

  useEffect(() => {
    const doctorId = localStorage.getItem("userId");
    if (!doctorId) return;

    fetchAppointments(doctorId, date, filterByDate);
  }, []);


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

    socket.on("appointmentAdded", () => {
      toast.success("Lịch hẹn đã được thêm — đang làm mới dữ liệu...");
      fetchAppointments(doctorId, date, filterByDate);
    });

    socket.on("appointmentUpdated", () => {
      toast.success("Lịch hẹn đã được cập nhật — đang làm mới dữ liệu...");
      fetchAppointments(doctorId, date, filterByDate);
    });

    socket.on("appointmentDeleted", () => {
      toast.success("Lịch hẹn đã được xóa — đang làm mới dữ liệu...");
      fetchAppointments(doctorId, date, filterByDate);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAppointments]);

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

  const exportAppointment = async (dat) => {
    const doctorId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:8080/appointments/export/pdf/${doctorId}?date=${dat?.toLocaleDateString("en-CA")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lich_hen_${dat?.toLocaleDateString("en-CA") || "tat_ca"}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Yêu cầu xuất lịch hẹn thành công xin đợi giây lát...");
    } catch (error) {
      console.error("Lỗi khi xuất lịch hẹn:", error);
      toast.error("Lỗi khi xuất lịch hẹn");
    }
  };

  const exportInvoice = async (appointmentId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `http://localhost:8080/appointments/invoice/${appointmentId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: "blob"
        }
      );
      const blob = new Blob([response.data], {
        type: "application/pdf"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hoa_don_kham_benh_${appointmentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Yêu cầu xuất hóa đơn thành công xin đợi giây lát...");
    } catch (error) {
      console.error("Lỗi khi xuất hóa đơn:", error);
      toast.error("Lỗi khi xuất hóa đơn");
    }
  };

  const addMedicine = () => {
    setPayload(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: "", quantity: 1, price: 0 }
      ]
    }));
  };

  const removeMedicine = (index) => {
    setPayload(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // console.log("A", appointments.length);
  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
        <ToastContainer position="top-right" autoClose={3000} />{" "}
        <div className="container mx-auto p-6">

          <div className="flex items-center bg-white rounded-2xl shadow-lg p-6 mb-8 w-full">
            <div className="flex flex-col w-full">
              <label htmlFor="" className="font-medium text-lg">Lọc theo ngày</label>
              <div className="lg:flex md:flex items-center gap-5 w-full">
                <div className="flex-1">
                  <Calendar
                    value={date}
                    readOnlyInput
                    onChange={(e) => {
                      setDate(e.value);
                      // setFilterByDate(true);
                      // const doctorId = localStorage.getItem("userId");
                      // fetchAppointments(doctorId, e.value, true);
                    }}
                    dateFormat="yy-mm-dd"
                    className="w-full"
                  />
                </div>
                <Button
                  label="Lọc"
                  icon="pi pi-filter"
                  onClick={() => {
                    const doctorId = localStorage.getItem("userId");
                    setFilterByDate(true);
                    fetchAppointments(doctorId, date, true);
                  }}
                  className="w-full md:w-auto"
                />
                <Button
                  label="Lấy tất cả"
                  onClick={() => {
                    const doctorId = localStorage.getItem("userId");
                    setFilterByDate(false); // tắt lọc ngày
                    fetchAppointments(doctorId, null, false);
                  }}
                  className="w-full md:w-auto"
                />
                <Button
                  label="Làm mới"
                  onClick={() => {
                    const doctorId = localStorage.getItem("userId");
                    setDate(new Date());
                    setFilterByDate(true); // tắt lọc ngày
                    fetchAppointments(doctorId, new Date(), true);
                  }}
                  className="w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          <div className="mt-2 md:flex md:items-center bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="md:flex-1" >
              <h2 className="text-3xl font-semibold text-blue-600">
                <i className="pi pi-user-plus mr-2 text-4xl"></i>
                Lịch hẹn
              </h2>
              <p className="text-lg text-gray-600">
                Tổng số lịch hẹn: {appointments.length}
              </p>
            </div>
            <div>
              <Button
                onClick={() => exportAppointment(date)}
                label="xuất lịch hẹn"
                icon="pi pi-list" />
            </div>
          </div>

          {appointments.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-3xl font-semibold mb-4 text-blue-600">
                <i className="pi pi-user-plus mr-2 text-blue-600 text-4xl"></i>
                Danh sách lịch hẹn
              </h2>
              <div className=" overflow-x-auto bg-white rounded-2xl shadow-lg ">
                <table className="min-w-full bg-white text-gray-800 border-collapse rounded-lg overflow-hidden text-center">
                  <thead>
                    <tr className="bg-blue-500  text-white text-center">
                      <th className="px-3 py-4 text-lg">STT</th>
                      <th className="px-3 py-4 text-lg">Bệnh nhân</th>
                      <th className="px-3 py-4 text-lg">Ngày hẹn khám</th>
                      <th className="px-3 py-4 text-lg">Thời gian</th>
                      <th className="px-3 py-4 text-lg">Bệnh lý</th>
                      <th className="px-3 py-4 text-lg">Trạng thái</th>
                      <th className="px-3 py-4 text-lg">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment, index) => (
                      <tr
                        key={appointment.appointmentId}
                        className={`group transition-all hover:bg-blue-200 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          }`}
                      >
                        <td>{index + 1}</td>
                        <td className="px-3 py-4 text-lg">{`${appointment.Patient.firstName} ${appointment.Patient.lastName}`}</td>
                        <td className="px-3 py-4 text-lg">
                          {appointment.appointmentDate}
                        </td>
                        <td className="px-3 py-4 text-lg">{`${appointment.startTime} - ${appointment.endTime}`}</td>
                        <td className="px-3 py-4 text-lg group-hover:overflow-visible relative">
                          <span className="">{appointment.disease}</span>
                          <div className="hidden absolute bg-white border border-gray-300 p-4 top-10 left-0 w-60 shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-2 transition-all">
                            <p className="text-sm font-normal text-gray-600">
                              {appointment.additionalInfo}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-lg">
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
                                <option value="scheduled">Chờ duyệt</option>
                                <option value="completed">Duyệt lịch</option>
                                <option value="canceled">Huỷ lịch</option>
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
                              className={`px-4 py-2 text-lg ${statusColors[appointment.status]
                                }`}
                            >
                              {appointment.status === "scheduled"
                                ? "Chờ duyệt"
                                : appointment.status === "completed"
                                  ? "Đã duyệt"
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
                              {appointment.appointmentDate >= new Date().toLocaleDateString("en-CA") ? <button
                                className={`${statusColors[appointment.status]
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
                              </button> : null}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-lg">
                          <div className="flex justify-center items-center space-x-4">
                            <div>
                              <button
                                className="text-red-600 ml-2"
                                onClick={() => deleteAppointment(appointment.appointmentId)}
                              >
                                <i className="pi pi-trash"></i>
                              </button>
                            </div>
                            <div><button onClick={() => { setVisible(true); setChange(true); setUseAppointment(appointment); }}><i className="pi pi-phone text-green-400"></i></button></div>
                            <div><button onClick={() => { setVisible(true); setChange(false); setTopic(""); setMessage(""); setUseAppointment(appointment); }}><i className="pi pi-envelope text-teal-400"></i></button></div>
                            {appointment.status === "completed" && (
                              <div><button onClick={() => { setVisiable2(true); resetpayLoad(); setCount(appointment.appointmentId); }}><i className="pi pi-receipt text-blue-400"></i></button></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          <div>
            <Dialog header={change ? <p>Gọi điện &#128222;</p> : <p>Gửi email &#128232;</p>} visible={visible} position style={{ width: 'auto' }} onHide={() => { if (!visible) return; setVisible(false); }} draggable={false} resizable={false}>
              {change ?
                <div className="flex justify-center items-center gap-5">
                  <div>Số điện thoại: {useAppointment?.Patient?.contactNumber}</div>
                  <div><button onClick={() => window.location.href = `tel:${useAppointment?.Patient?.contactNumber}`} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Gọi ngay
                  </button></div>
                </div>
                :
                <div>
                  <div> Đến Email: {useAppointment?.Patient?.email}</div>
                  <div className="mt-4">
                    <label htmlFor="subject" className="block mb-2 font-medium">Chủ đề:</label>
                    <input type="text" id="subject" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nhập chủ đề email..." value={topic} onChange={(e) => setTopic(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="message" className="block mb-2 font-medium">Nội dung:</label>
                    <textarea id="message" rows="4" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nhập nội dung email ở đây..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                  </div>
                  <div className="mt-4">
                    <button onClick={() => sendMail(useAppointment?.Patient, useAppointment?.Doctor, useAppointment)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                      Gửi Email
                    </button>
                  </div>
                </div>}
            </Dialog>
          </div>
          <div>
            <Dialog header={<p>Tải hóa đơn &#128179;</p>} visible={visiable2} position style={{ width: 'auto' }} onHide={() => { if (!visiable2) return; setVisiable2(false); }} draggable={false} resizable={false}>
              <div className="flex flex-col gap-5">
                <div>Bệnh nhân: {useAppointment?.Patient?.firstName} {useAppointment?.Patient?.lastName}</div>
                <div>
                  <label htmlFor="quantity" className="block mb-2 font-medium">Dịch vụ khám</label>
                  <InputText
                    value={payload.service}
                    onChange={(e) => setPayload({ ...payload, service: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block mb-2 font-medium">Giá dịch vụ</label>
                  <InputNumber value={payload.examFee}
                    min={0}
                    onValueChange={(e) => setPayload({ ...payload, examFee: e.target.value })}
                    className="w-full" suffix=" VND" />
                </div>
                {payload.medicines.map((medicine, index) => (
                  <div key={index} className="border p-3 rounded-md mb-3 flex gap-3 items-end">
                    <div>
                      <label className="block mb-1 font-medium">Tên thuốc</label>
                      <InputText
                        value={medicine.name}
                        onChange={(e) => {
                          const newMedicines = [...payload.medicines];
                          newMedicines[index].name = e.target.value;
                          setPayload({ ...payload, medicines: newMedicines });
                        }}
                        className="w-40"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">SL</label>
                      <InputText
                        type="number"
                        value={medicine.quantity}
                        min={0}
                        onChange={(e) => {
                          const newMedicines = [...payload.medicines];
                          newMedicines[index].quantity = Number(e.target.value);
                          setPayload({ ...payload, medicines: newMedicines });
                        }}
                        className="w-20"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Giá</label>
                      <InputNumber value={medicine.price}
                        min={0}
                        onValueChange={(e) => {
                          const newMedicines = [...payload.medicines];
                          newMedicines[index].price = Number(e.target.value);
                          setPayload({ ...payload, medicines: newMedicines });
                        }}
                        className="w-auto" suffix=" VND" />
                    </div>
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger p-button-text"
                      onClick={() => removeMedicine(index)}
                    />
                  </div>
                ))}
                <div>
                  <Button
                    icon="pi pi-plus"
                    label="Thêm thuốc"
                    className="p-button-sm p-button-success"
                    onClick={addMedicine}
                  />
                </div>
                <div>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => exportInvoice(count)}
                  >
                    Tải hóa đơn
                  </button>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;