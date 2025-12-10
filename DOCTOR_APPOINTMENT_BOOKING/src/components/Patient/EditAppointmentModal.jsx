import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditAppointmentModal = ({
  appointment,
  closeModal,
  updateAppointment
}) => {
  const doctorFirstName = appointment.Doctor.firstName || "";
  const doctorLastName = appointment.Doctor.lastName || "";

  const [editedData, setEditedData] = useState({
    doctorId: appointment.Doctor.doctorId,
    doctorFirstName: doctorFirstName,
    doctorLastName: doctorLastName,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime.substring(0, 5), // Format HH:mm
    endTime: appointment.endTime.substring(0, 5), // Format HH:mm
    disease: appointment.disease,
    status: appointment.status,
    additionalInfo: appointment.additionalInfo || ""
  });

  const today = new Date().toISOString().split("T")[0];

  const getCurrentTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // Generate time options for business hours (08:00 - 17:00)
  const timeOptions = useMemo(() => {
    const times = [];
    for (let h = 8; h <= 17; h++) {
      times.push(`${String(h).padStart(2, "0")}:00`);
    }
    return times;
  }, []);

  // Get minimum start time based on selected date
  const getMinStartTime = () => {
    if (editedData.appointmentDate === today) {
      const now = getCurrentTime();
      const currentHour = parseInt(now.split(":")[0]);
      return `${String(currentHour).padStart(2, "0")}:00`;
    }
    return "00:00";
  };

  const handleChange = (name, value) => {
    if (name === "appointmentDate") {
      if (value < today) {
        toast.error("Ngày hẹn không được là quá khứ.", { 
          position: "top-right", 
          autoClose: 3000 
        });
        return;
      }
      // Reset times when date changes
      setEditedData({ ...editedData, [name]: value, startTime: "", endTime: "" });
    } else if (name === "startTime") {
      // Check if start time is valid for selected date
      if (editedData.appointmentDate === today) {
        const minTime = getMinStartTime();
        if (value < minTime) {
          toast.error("Giờ bắt đầu không được là quá khứ.", { 
            position: "top-right", 
            autoClose: 3000 
          });
          return;
        }
      }
      setEditedData({ ...editedData, [name]: value });
    } else if (name === "endTime") {
      // Check if end time is after start time
      if (editedData.startTime && value <= editedData.startTime) {
        toast.error("Giờ kết thúc phải sau giờ bắt đầu.", { 
          position: "top-right", 
          autoClose: 3000 
        });
        return;
      }
      setEditedData({ ...editedData, [name]: value });
    } else {
      setEditedData({ ...editedData, [name]: value });
    }
  };

  const handleSave = () => {
    // Final validation before save
    if (!editedData.appointmentDate || !editedData.startTime || !editedData.endTime || !editedData.disease) {
      toast.error("Vui lòng điền đầy đủ thông tin.", { 
        position: "top-right", 
        autoClose: 3000 
      });
      return;
    }

    if (editedData.endTime <= editedData.startTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.", { 
        position: "top-right", 
        autoClose: 3000 
      });
      return;
    }

    updateAppointment(editedData);
  };

  return (
    <div className="fixed top-5 left-0 w-full h-full flex items-center justify-center z-50 bg-opacity-10 backdrop-blur-xs">
      <div className="bg-white p-6 w-full max-w-md rounded-2xl shadow-lg border-2 border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold text-blue-600 text-center flex-1">
            Chỉnh sửa lịch hẹn
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="text-blue-600 hover:text-blue-400 focus:outline-none ml-4 text-2xl"
          >
            <i className="pi pi-times"></i>
          </button>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-user-md mr-2 text-blue-600"></i>
              Bác sĩ
            </label>
            <input
              type="text"
              name="doctorFirstName"
              value={`${editedData.doctorFirstName} ${editedData.doctorLastName}`}
              readOnly 
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-600 text-bold text-sm font-bold mb-2">
              <i className="pi pi-calendar mr-2 text-blue-600"></i>
              Ngày hẹn
            </label>
            <input
              type="date"
              name="appointmentDate"
              min={today}
              value={editedData.appointmentDate}
              onChange={(e) => handleChange("appointmentDate", e.target.value)}
              placeholder="Chọn ngày khám"
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-700 cursor-pointer"
              style={{
                colorScheme: 'light'
              }}
              onFocus={(e) => {
                try {
                  e.target.showPicker();
                } catch (error) {
                  // Fallback for browsers that don't support showPicker()
                }
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-clock mr-2 text-blue-600"></i>
              Giờ bắt đầu
            </label>
            <select
              name="startTime"
              value={editedData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-700 bg-white appearance-none"
              required
            >
              <option value="">Chọn giờ bắt đầu</option>
              {timeOptions
                .filter((time) => {
                  if (editedData.appointmentDate === today) {
                    return time >= getMinStartTime();
                  }
                  return true;
                })
                .map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-clock mr-2 text-blue-600"></i>
              Giờ kết thúc
            </label>
            <select
              name="endTime"
              value={editedData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-700 bg-white appearance-none"
              disabled={!editedData.startTime}
              required
            >
              <option value="">Chọn giờ kết thúc</option>
              {timeOptions
                .filter((time) => editedData.startTime && time > editedData.startTime)
                .map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-exclamation-circle mr-2 text-blue-600"></i>
              Triệu chứng / Bệnh lý
            </label>
            <input
              type="text"
              name="disease"
              value={editedData.disease}
              onChange={(e) => handleChange("disease", e.target.value)}
              placeholder="Nhập tóm gọn triệu chứng"
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-700"
              required
            />
          </div>

          {/* <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-info-circle mr-2 text-blue-600"></i>
              Trạng thái
            </label>
            <select
              name="status"
              value={editedData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-700 bg-white appearance-none"
            >
              <option value="scheduled">Đã lên lịch</option>
              <option value="completed">Hoàn thành</option>
              <option value="canceled">Đã hủy</option>
            </select>
          </div> */}


          <div className="flex justify-center gap-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              <i className="pi pi-save mr-2"></i>
              Lưu thay đổi
            </button>
            <button
              onClick={closeModal}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline-red active:bg-red-700 transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              <i className="pi pi-times mr-2"></i>
              Hủy
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EditAppointmentModal;