import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const MyProfile = () => {
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    contactNumber: "",
    bloodGroup: ""
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const today = new Date().toISOString().split('T')[0];

  const fetchPatientInfo = async () => {
    const patientId = localStorage.getItem("userId");
    try {
      if (patientId) {
        const response = await axios.get(
          `http://localhost:8080/patients/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPatient(response.data.patient);
        setFormData({
          firstName: response.data.patient.firstName || "",
          lastName: response.data.patient.lastName || "",
          email: response.data.patient.email || "",
          gender: response.data.patient.gender || "",
          dateOfBirth: response.data.patient.dateOfBirth || "",
          contactNumber: response.data.patient.contactNumber || "",
          bloodGroup: response.data.patient.bloodGroup || ""
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bệnh nhân:", error);
    }
  };

  useEffect(() => {
    fetchPatientInfo();
  }, [token]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original patient data
    if (patient) {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        gender: patient.gender || "",
        dateOfBirth: patient.dateOfBirth || "",
        contactNumber: patient.contactNumber || "",
        bloodGroup: patient.bloodGroup || ""
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      const response = await axios.patch(
        `http://localhost:8080/patients/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setPatient({ ...patient, ...formData });
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Bạn không có quyền cập nhật thông tin này.");
      } else {
        console.error("Lỗi khi cập nhật thông tin bệnh nhân:", error);
        toast.error("Lỗi khi cập nhật thông tin!");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans py-8">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-blue-500 py-6 px-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ cá nhân</h1>
                  <p className="text-blue-100">Quản lý thông tin cá nhân của bạn</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="pi pi-pencil" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>

          {patient ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                {/* Avatar Section */}
                <div className="lg:col-span-1 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-blue-100 mb-4">
                    <img
                      src={
                        patient.gender === "female"
                          ? "https://png.pngtree.com/png-vector/20190130/ourlarge/pngtree-cute-girl-avatar-material-png-image_678035.jpg"
                          : "https://yt3.googleusercontent.com/ytc/AGIKgqNO2Cz7ILUFn2DRPVjta3eANRPAhbI8eMeqcSjA=s900-c-k-c0x00ffffff-no-rj"
                      }
                      alt={`${patient.firstName} ${patient.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {patient.firstName} {patient.lastName}
                    </h2>
                    <p className="text-blue-500">Bệnh nhân</p>
                  </div>
                </div>

                {/* Information Section */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-user text-blue-600" />
                        Họ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                          {patient.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-user text-blue-600" />
                        Tên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                          {patient.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-envelope text-blue-600" />
                        Email
                      </label>
                      <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                        {patient.email}
                      </p>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-phone text-blue-600" />
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                          {patient.contactNumber}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-calendar text-blue-600" />
                        Ngày sinh
                      </label>
                        {isEditing ? (
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          max={today}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                          {patient.dateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-mars text-blue-600" />
                        Giới tính
                      </label>
                      {isEditing ? (
                        <div className="flex gap-6 px-4 py-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="male"
                              checked={formData.gender === "male"}
                              onChange={() => handleInputChange("gender", "male")}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Nam</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="female"
                              checked={formData.gender === "female"}
                              onChange={() => handleInputChange("gender", "female")}
                              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Nữ</span>
                          </label>
                        </div>
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg capitalize">
                          {patient.gender === "male" ? "Nam" : "Nữ"}
                        </p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <i className="pi pi-tint text-blue-600" />
                        Nhóm máu
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Chọn nhóm máu</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      ) : (
                        <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                          {patient.bloodGroup}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold 
hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg 
flex items-center justify-center gap-2"
                      >
                        <i className="pi pi-check" />
                        Cập nhật
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <i className="pi pi-times" />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyProfile;