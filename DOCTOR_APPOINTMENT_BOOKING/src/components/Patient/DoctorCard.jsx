import React, { useState } from "react";
import axios from "axios";
import AppointmentForm from "./AppointmentForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog } from "primereact/dialog";  

const DoctorCard = ({ doctor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAppointmentSubmit = (appointmentData) => {
    const patientId = JSON.parse(localStorage.getItem("userId"));

    appointmentData.patient = patientId;
    appointmentData.doctor = doctor.doctorId; 
    axios
      .post(
        "http://localhost:8080/appointments/",
        appointmentData
      )
      .then((response) => {
        toast.success("Đặt lịch hẹn thành công!");
        // updateDoctorAppointments(response.data.doctor, response.data._id);
        // updatePatientAppointments(response.data.patient, response.data._id);
        closeModal();
      })
      .catch((error) => {
        toast.error("Lỗi khi đặt lịch hẹn");
        console.error("Error creating appointment:", error);
      });
  };

  const updateDoctorAppointments = (doctorId, appointmentId) => {
    const token = localStorage.getItem("token");
    console.log("Updating doctor appointments. Doctor ID:", doctorId, token);

    const requestBody = {
      appointmentId: appointmentId,
      role: "doctor"
    };

    axios
      .patch(
        `http://localhost:8080/appointments/${doctorId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        toast.success("Cập nhật lịch hẹn của bác sĩ thành công");
      })
      .catch((error) => {
        toast.error("Lỗi khi cập nhật lịch hẹn của bác sĩ");
        console.error("Error updating doctor's appointments:", error);
      });
  };

  const updatePatientAppointments = (patientId, appointmentId) => {
    const token = localStorage.getItem("token");
    console.log("Updating patient appointments. Patient ID:", patientId, token);
    const requestBody = {
      appointmentId: appointmentId,
      role: "doctor"
    };
    axios
      .patch(
        `http://localhost:8080/appointments/${patientId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        toast.success("Cập nhật lịch hẹn của bệnh nhân thành công");
      })
      .catch((error) => {
        toast.error("Lỗi khi cập nhật lịch hẹn của bệnh nhân");
        console.error("Lỗi khi cập nhật lịch hẹn của bệnh nhân:", error);
      });
  };

  return (
    <div className=" bg-white p-4 rounded-lg shadow-lg mb-4">
      <ToastContainer position="top-right" autoClose={3000} />{" "}
      <div className="relative h-64 mb-4">
        <img
          src={doctor.profile}
          alt={`${doctor.firstName} ${doctor.lastName}`}
          className="w-full h-full rounded-lg"
        />
        <div className="absolute bottom-0 left-0 p-2 bg-blue-500 text-white rounded-tr-lg">
          <i className="pi pi-heart mr-2"></i>
          {doctor.specialty}
        </div>
      </div>
      <div className="text-blue-600 font-semibold mb-2">
        Bs. {doctor.firstName} {doctor.lastName}
      </div>
      <div className="text-gray-700 text-sm mb-2">
        <i className="pi pi-map-marker mr-2"></i>
        {doctor.clinicLocation}
      </div>
      <div className="text-gray-700 text-sm mb-2">
        <i className="pi pi-phone mr-2"></i>
        {doctor.contactNumber}
      </div>
      <div className="text-gray-700 text-sm mb-2">
        <i className="pi pi-clock mr-2"></i>
        Giờ làm việc: {doctor.workingHours ? `${doctor.workingHours} giờ/ngày` : "Chưa cập nhật"}
      </div>
      <div className="text-gray-700 text-sm mb-2">
        <i className="pi pi-user mr-2"></i>
        {doctor.about}
      </div>
      <div className="text-center">
        <button
          onClick={openModal}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full focus:ring-2 focus:ring-blue-500 active:bg-blue-800 transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <i className="pi pi-calendar mr-2"></i>
          Đặt lịch hẹn
        </button>
      </div>

      <Dialog
        visible={isModalOpen}
        modal
        closable = {false}
        draggable={false}
        onHide={closeModal}
      >
        <AppointmentForm
          doctor={doctor}
          onSubmit={handleAppointmentSubmit}
          onCancel={closeModal}
        />
      </Dialog>
    </div>
  );
};

export default DoctorCard;
