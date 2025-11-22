import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "../../components/Breadcrumb";
import EditAppointmentModal from "../../components/Patient/EditAppointmentModal";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";
const statusColors = {
  scheduled: "text-blue-500 ",
  completed: "text-green-500 ",
  canceled: "text-red-500 "
};

const MyAppointment = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState(null);
  const [editedStatus, setEditedStatus] = useState({});
  const token = localStorage.getItem("token");
  // console.log("patientData", patient);
  // console.log("appointmentData", appointments);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const patientId = localStorage.getItem("userId");

  const fetchAppointments  = async () => {
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
        console.log("response", data);
        // setPatient(data);
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchPatientInfo = async () => {
    const patientId = localStorage.getItem("userId");
    try {
      if (patientId) {
        const response = await axios.get(
          `http://localhost:8080/patients/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatient(response.data.patient);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientInfo();
  }, [token]);

  useEffect(() => {
    const patientId = localStorage.getItem("userId");
    if (!patientId) return;

    const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.emit("joinRoom", `patient_${patientId}`);
    console.log(`Joined room: patient_${patientId}`);

    const refreshAppointments = () => {
      console.log("Appointment changed — refreshing list...");
      fetchAppointments();
    };

    socket.on("appointmentAdded", refreshAppointments);
    socket.on("appointmentUpdated", refreshAppointments);
    socket.on("appointmentDeleted", refreshAppointments);
    return () => {
      socket.disconnect();
      console.log("Socket disconnected (MyAppointment)");
    };
  }, []);

  const updatePatientDetail = async (field, value) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      // console.log("token userId", token, userId);
      const requestBody = {
        [field]: value
      };

      const response = await axios.patch(
        `http://localhost:8080/patients/${userId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedPatient = { ...patient, [field]: value };
        setPatient(updatedPatient);
        setEditingField(null);
        toast.success(`Successfully updated ${field}`);
      } else {
        console.error("Failed to update patient detail");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("You don't have permission to update this field.");
      } else {
        console.error("Error updating patient detail:", error);
        toast.error(`Error updating ${field}`);
      }
    }
  };

  const openEditModal = (appointment) => {
    setEditAppointmentData(appointment);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const updateAppointmentData = async (updatedData) => {
    const token = localStorage.getItem("token");
    // console.log("token", token);
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
          appointment?.appointmentId === editAppoippointment?.appointmentId
            ? { ...appointment, ...updatedData }
            : appointment
        );
        setAppointments(updatedAppointments);
        setEditModalOpen(false);
        toast.success("Appointment updated successfully");
      } else {
        console.error("Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error updating appointment");
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
          (appointment) => appointment?.appointmentId !== appointmentId
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
    // console.log("token", token);
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
        toast.success("Appointment status updated successfully");
      } else {
        console.error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Error updating appointment status");
    }
  };

  function formatTimeToAMPM(time) {
    const [hours, minutes] = time.split(":");
    let period = "AM";
    let formattedHours = parseInt(hours, 10);

    if (formattedHours >= 12) {
      period = "PM";
      if (formattedHours > 12) {
        formattedHours -= 12;
      }
    }

    return `${formattedHours}:${minutes} ${period}`;
  }

  const breadcrumbs = [
    { title: "Home", link: "/patient-dashboard" },
    { title: "My Appointment", link: "/myappointment" }
  ];
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className=" bg-gray-100 min-h-screen font-sans">
        <ToastContainer position="top-right" autoClose={3000} />{" "}
        <div className="container mx-auto py-8 mt-12 w-[95%]">
          <Breadcrumb items={breadcrumbs} />
          <div className="border border-gray-300 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-1 flex items-center">
                {patient ? (
                  <div>
                    <h2 className="text-3xl font-semibold mb-2 text-blue-600">
                      <i className="pi pi-user mr-2 text-4xl" />
                      {patient.firstName} {patient.lastName}
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
                            updatePatientDetail("firstName", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-user text-blue-600 mr-2 text-xl" /> 
                        <p className="text-lg text-gray-600">First Name:</p>
                        <p className="text-lg ml-2">{patient.firstName}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("firstName");
                            setEditedValue(patient.firstName);
                          }}
                        >
                          <i className="pi pi-pencil" />
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
                            updatePatientDetail("lastName", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-user text-blue-600 mr-2 text-xl" />
                        <p className="text-lg text-gray-600">Last Name:</p>
                        <p className="text-lg ml-2">{patient.lastName}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("lastName");
                            setEditedValue(patient.lastName);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}
                    {/* Email */}
                    {editingField === "email" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="email"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updatePatientDetail("email", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-envelope text-blue-600 mr-2 w-5 h-5" />
                        <p className="text-lg text-gray-600">Email:</p>
                        <p className="text-lg ml-2">{patient.email}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("email");
                            setEditedValue(patient.email);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}

                    {/* Gender */}
                    {editingField === "gender" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="radio"
                          value="male"
                          checked={editedValue === "male"}
                          onChange={() => setEditedValue("male")}
                        />
                        <label className="ml-2">Male</label>
                        <input
                          type="radio"
                          value="female"
                          checked={editedValue === "female"}
                          onChange={() => setEditedValue("female")}
                        />
                        <label className="ml-2">Female</label>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updatePatientDetail("gender", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-mars text-blue-600 mr-2 w-5 h-5" />
                        <p className="text-lg text-gray-600">Gender:</p>
                        <p className="text-lg ml-2">{patient.gender}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("gender");
                            setEditedValue(patient.gender);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}

                    {/* Date of Birth */}
                    {editingField === "dateOfBirth" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="date"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updatePatientDetail("dateOfBirth", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-calendar text-blue-600 mr-2 w-5 h-5" />
                        <p className="text-lg text-gray-600">Date of Birth:</p>
                        <p className="text-lg ml-2">{patient.dateOfBirth}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("dateOfBirth");
                            setEditedValue(patient.dateOfBirth);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}

                    {/* Contact Number */}
                    {editingField === "contactNumber" ? (
                      <div className="flex items-center mb-4">
                        <input
                          type="tel"
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        />
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updatePatientDetail("contactNumber", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-phone text-blue-600 mr-2 w-5 h-5" />
                        <p className="text-lg text-gray-600">Contact Number:</p>
                        <p className="text-lg ml-2">{patient.contactNumber}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("contactNumber");
                            setEditedValue(patient.contactNumber);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}

                    {/* Blood Group */}
                    {editingField === "bloodGroup" ? (
                      <div className="flex items-center mb-4">
                        <select
                          value={editedValue}
                          onChange={(e) => setEditedValue(e.target.value)}
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() =>
                            updatePatientDetail("bloodGroup", editedValue)
                          }
                        >
                          <i className="pi pi-save" />
                        </button>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => {
                            setEditingField(null);
                            setEditedValue("");
                          }}
                        >
                          <i className="pi pi-times" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center mb-4">
                        <i className="pi pi-tint text-blue-600 mr-2 w-5 h-5" />
                        <p className="text-lg text-gray-600">Blood Group:</p>
                        <p className="text-lg ml-7">{patient.bloodGroup}</p>
                        <button
                          className="text-blue-600 ml-2"
                          onClick={() => {
                            setEditingField("bloodGroup");
                            setEditedValue(patient.bloodGroup);
                          }}
                        >
                          <i className="pi pi-pencil" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg">Loading patient data...</p>
                )}
              </div>

              <div className="md:col-span-1">
                <div className="w-96 h-96 mx-auto relative rounded-full overflow-hidden">
                  <img
                    src={
                      patient ? patient.gender === "female" ? "https://png.pngtree.com/png-vector/20190130/ourlarge/pngtree-cute-girl-avatar-material-png-image_678035.jpg" : "https://yt3.googleusercontent.com/ytc/AGIKgqNO2Cz7ILUFn2DRPVjta3eANRPAhbI8eMeqcSjA=s900-c-k-c0x00ffffff-no-rj": "https://cdn-media.sforum.vn/storage/app/media/THANHAN/avatar-trang-99.jpg"
                    }
                    alt={
                      patient ? `${patient.firstName} ${patient.lastName}` : ""
                    }
                    className="w-96 h-96 object-cover mix-blend-multiply"
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
              <i className="pi pi-calendar-plus mr-2 text-4xl" />
              Appointments
            </h2>
            <p className="text-lg text-gray-600">
              Total Appointments: {appointments.length}
            </p>
          </div>

          <hr className="my-6 border-t border-gray-300" />

          <div className="mt-8">
            {appointments.length > 0 ? (
              <>
                <h2 className="text-3xl font-semibold mb-4 text-blue-600">
                  <i className="pi pi-calendar-plus mr-2 text-blue-600 text-4xl" />
                  Upcoming Appointments
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white text-gray-800 border-collapse rounded-lg overflow-hidden text-center">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white text-center">
                        <th className="px-6 py-4 text-lg">Doctor</th>
                        <th className="px-6 py-4 text-lg">Date</th>
                        <th className="px-6 py-4 text-lg">Time</th>
                        <th className="px-6 py-4 text-lg">Disease</th>
                        <th className="px-6 py-4 text-lg">Status</th>
                        <th className="px-6 py-4 text-lg">Actions </th>
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
                          <td className="px-6 py-4 text-lg">{`${formatTimeToAMPM(
                            appointment.startTime
                          )} - ${formatTimeToAMPM(appointment.endTime)}`}</td>

                          <td className="px-6 py-4 text-lg group-hover:overflow-visible relative">
                            <span className="">{appointment.disease}</span>
                            <div className="hidden absolute bg-white border border-gray-300 p-4 top-10 left-0 w-60 shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-2 transition-all">
                              <p className="text-sm font-normal text-gray-600">
                                {appointment.additionalInfo}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-lg">
                            {editingField === appointment?.appointmentId ? (
                              <div className="flex items-center">
                                <select
                                  value={
                                    editedStatus[appointment?.appointmentId] ||
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
                                {appointment.status}
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
                                <button
                                  className={`${
                                    statusColors[appointment.status]
                                  } ml-2 text-sm`}
                                  onClick={() => {
                                    setEditingField(appointment?.appointmentId);
                                    setEditedStatus({
                                      ...editedStatus,
                                      [appointment?.appointmentId]: appointment.status
                                    });
                                  }}
                                >
                                  <i className="pi pi-pencil" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-lg">
                            <button
                              className="text-blue-600 ml-2"
                              onClick={() => openEditModal(appointment)}
                            >
                              <i className="pi pi-pencil" />
                            </button>
                            <button
                              className="text-red-600 ml-2"
                              onClick={() => deleteAppointment(appointment?.appointmentId)}
                            >
                              <i className="pi pi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
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

      {/* <Footer /> */}
    </>
  );
};

export default MyAppointment;
