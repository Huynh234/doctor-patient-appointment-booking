import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const AppointmentForm = ({ doctor, onSubmit, onCancel }) => {
  const [appointmentData, setAppointmentData] = useState({
    patient: "",
    doctor: doctor.doctorId,
    appointmentDate: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    disease: ""
  });

   const [selectedStime, setselectedStime] = useState(null);
    const timeSlots = [
        { name: '7:00', startTime: '7:00', endTime:'7:30' },
        { name: '7:30', startTime: '7:30', endTime:'8:00' },
        { name: '8:00', startTime: '8:00', endTime:'8:30' },
        { name: '8:30', startTime: '8:30', endTime:'9:00' },
        { name: '9:00', startTime: '9:00', endTime:'9:30' },
        { name: '9:30', startTime: '9:30', endTime:'10:00' },
        { name: '10:00', startTime: '10:00', endTime:'10:30' },
        { name: '10:30', startTime: '10:30', endTime:'11:00' },
        { name: '11:00', startTime: '11:00', endTime:'11:30' },
        { name: '11:30', startTime: '11:30', endTime:'12:00' },
        { name: '12:00', startTime: '12:00', endTime:'12:30' },
        { name: '12:30', startTime: '12:30', endTime:'13:00' },
        { name: '13:00', startTime: '13:00', endTime:'13:30' },
        { name: '13:30', startTime: '13:30', endTime:'14:00' },
        { name: '14:00', startTime: '14:00', endTime:'14:30' },
        { name: '14:30', startTime: '14:30', endTime:'15:00' },
        { name: '15:00', startTime: '15:00', endTime:'15:30' },
        { name: '15:30', startTime: '15:30', endTime:'16:00' },
        { name: '16:00', startTime: '16:00', endTime:'16:30' },
        { name: '16:30', startTime: '16:30', endTime:'17:00' },
        { name: '17:00', startTime: '17:00', endTime:'17:30' },
    ];

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
    if (appointmentData.appointmentDate === today) {
      const now = getCurrentTime();
      const currentHour = parseInt(now.split(":")[0]);
      return `${String(currentHour).padStart(2, "0")}:00`;
    }
    return "00:00";
  };

  // Validate times on change
  const handleInputChange = (name, value) => {
    if (name === "appointmentDate") {
      if (value < today) {
        toast.error("Ngày hẹn không được là quá khứ.", { position: "top-right", autoClose: 3000 });
        return;
      }
      // Reset times when date changes
      setAppointmentData({ ...appointmentData, [name]: value, startTime: "", endTime: "" });
    } else if (name === "startTime") {
      // Check if start time is valid for selected date
      if (appointmentData.appointmentDate === today) {
        const minTime = getMinStartTime();
        if (value < minTime) {
          toast.error("Giờ bắt đầu không được là quá khứ.", { position: "top-right", autoClose: 3000 });
          return;
        }
      }
      setAppointmentData({ ...appointmentData, [name]: value });
    } else if (name === "endTime") {
      // Check if end time is after start time
      if (appointmentData.startTime && value <= appointmentData.startTime) {
        toast.error("Giờ kết thúc phải sau giờ bắt đầu.", { position: "top-right", autoClose: 3000 });
        return;
      }
      setAppointmentData({ ...appointmentData, [name]: value });
    } else {
      setAppointmentData({ ...appointmentData, [name]: value });
    }
  };

  const handleSubmit = () => {
    // Final validation before submit
    if (!appointmentData.appointmentDate || !appointmentData.startTime || !appointmentData.endTime || !appointmentData.disease) {
      toast.error("Vui lòng điền đầy đủ thông tin.", { position: "top-right", autoClose: 3000 });
      return;
    }

    if (appointmentData.endTime <= appointmentData.startTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.", { position: "top-right", autoClose: 3000 });
      return;
    }

    onSubmit(appointmentData);
  };

  return (
    <div className="w-full h-full flex items-center justify-center z-50 bg-opacity-10 backdrop-blur-xs">
      <div className="bg-white p-4 w-full max-w-md bg-opacity-20 backdrop-blur-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold text-blue-600 text-center">
            Đặt lịch hẹn với Bs. {doctor.lastName}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-400 focus:outline-none"
          >
            <i className="pi pi-times"></i>
          </button>
        </div>
        <div>
          <div className="mb-4">
            <label className="block text-blue-600 text-bold text-sm font-bold mb-2">
              <i className="pi pi-calendar mr-2 text-blue-600"></i>
              Ngày hẹn
            </label>
            <input
              type="date"
              name="appointmentDate"
              min={today}
              value={appointmentData.appointmentDate}
              onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
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
            <Dropdown value={selectedStime} onChange={(e) => {setselectedStime(e.value); setAppointmentData({...appointmentData, startTime: e.value.startTime, endTime: e.value.endTime})}} optionsValue="startTime" options={timeSlots} optionLabel="name"
              placeholder="Giờ bắt đầu" className="w-full md:w-14rem" />    
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-clock mr-2 text-blue-600"></i>
              Giờ kết thúc
            </label>
            <InputText value={appointmentData.endTime} placeholder="Giờ kết thúc" className="w-full md:w-14rem" disabled />
          </div>
          <div className="mb-4">
            <label className="block text-blue-600 text-sm font-bold mb-2">
              <i className="pi pi-exclamation-circle mr-2 text-blue-600"></i>
              Triệu chứng / Bệnh lý
            </label>
            <input
              type="text"
              name="disease"
              value={appointmentData.disease}
              onChange={(e) => handleInputChange("disease", e.target.value)}
              placeholder="Nhập tóm gọn triệu chứng"
              className="w-full border-2 border-blue-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-700"
              required
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transform hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              <i className="pi pi-save mr-2"></i>
              Đặt lịch hẹn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;