import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialty: "",
    clinicLocation: "",
    contactNumber: "",
    email: "",
    workingHours: "",
    about: ""
  });
  const token = localStorage.getItem("token");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchDoctorInfo = async () => {
    const doctorId = localStorage.getItem("userId");
    try {
      if (doctorId) {
        const response = await axios.get(
          `http://localhost:8080/doctors/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const doctorData = response.data.doctor || response.data;
        setDoctor(doctorData);
        setFormData({
          firstName: doctorData.firstName || "",
          lastName: doctorData.lastName || "",
          specialty: doctorData.specialty || "",
          clinicLocation: doctorData.clinicLocation || "",
          contactNumber: doctorData.contactNumber || "",
          email: doctorData.email || "",
          workingHours: doctorData.workingHours || "",
          about: doctorData.about || ""
        });
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  useEffect(() => {
    fetchDoctorInfo();
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
    // Reset form data to original doctor data
    if (doctor) {
      setFormData({
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        specialty: doctor.specialty || "",
        clinicLocation: doctor.clinicLocation || "",
        contactNumber: doctor.contactNumber || "",
        email: doctor.email || "",
        workingHours: doctor.workingHours || "",
        about: doctor.about || ""
      });
    }
  };

  const handleUpdate = async () => {
    // Validate phone number
    const phoneNumber = formData.contactNumber.replace(/\D/g, '');
    if (phoneNumber.length < 10 || phoneNumber.length > 11) {
      toast.error("Số điện thoại phải có từ 10 đến 11 số!");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const requestBody = {
        ...formData,
        role: "doctor"
      };

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
        setDoctor({ ...doctor, ...formData });
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating doctor info:", error);
      toast.error("Lỗi khi cập nhật thông tin!");
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
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">Hồ sơ bác sĩ</h1>
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

          {doctor ? (
            <>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                  {/* Avatar Section */}
                  <div className="lg:col-span-1 flex flex-col items-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-blue-100 mb-4">
                      <img
                        src={doctor.profile}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        BS. {doctor.firstName} {doctor.lastName}
                      </h2>
                      <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
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
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.firstName}
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
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.lastName}
                          </p>
                        )}
                      </div>

                      {/* Specialty */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-map-marker text-blue-600" />
                          Chuyên khoa
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.specialty}
                            onChange={(e) => handleInputChange("specialty", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.specialty}
                          </p>
                        )}
                      </div>

                      {/* Contact Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-phone text-blue-600" />
                          Số điện thoại
                        </label>
                        {isEditing ? (
                          <div>
                            <input
                              type="tel"
                              value={formData.contactNumber}
                              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="10-11 số"
                            />
                            <p className="text-xs text-gray-500 mt-1">Số điện thoại phải có từ 10 đến 11 số</p>
                          </div>
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.contactNumber}
                          </p>
                        )}
                      </div>

                      {/* Email (read-only while editing) */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-envelope text-blue-600" />
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email || doctor.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                          />
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.email}
                          </p>
                        )}
                      </div>

                      {/* Working Hours (now shares row with Email) */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-clock text-blue-600" />
                          Giờ làm việc
                        </label>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={formData.workingHours}
                              onChange={(e) => handleInputChange("workingHours", e.target.value)}
                              className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              min="1"
                              max="24"
                            />
                            <span className="text-gray-600">giờ/ngày</span>
                          </div>
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.workingHours} giờ/ngày
                          </p>
                        )}
                      </div>

                      {/* Clinic Location */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-map-marker text-blue-600" />
                          Địa chỉ phòng khám
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.clinicLocation}
                            onChange={(e) => handleInputChange("clinicLocation", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.clinicLocation}
                          </p>
                        )}
                      </div>

                      {/* About */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-blue-600 flex items-center gap-2">
                          <i className="pi pi-info-circle text-blue-600" />
                          Giới thiệu
                        </label>
                        {isEditing ? (
                          <textarea
                            value={formData.about}
                            onChange={(e) => handleInputChange("about", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            rows="4"
                            placeholder="Giới thiệu về bản thân..."
                          />
                        ) : (
                          <p className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300">
                            {doctor.about}
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

              {/* About Doctor Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <i className="pi pi-info-circle text-blue-600 text-3xl" />
                  Giới thiệu về BS. {doctor.firstName} {doctor.lastName}
                </h2>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Bác sĩ {doctor.firstName} {doctor.lastName} là một chuyên gia y tế dày dặn kinh nghiệm và được đánh giá rất cao trong lĩnh vực {doctor.specialty}. 
                    Với kinh nghiệm sâu rộng chuyên về {doctor.specialty}, bác sĩ {doctor.lastName} đã xây dựng được danh tiếng về sự tận tâm, chuyên nghiệp và hết lòng vì sức khỏe của bệnh nhân. 
                    Tốt nghiệp với thành tích xuất sắc từ một cơ sở đào tạo y khoa uy tín, bác sĩ {doctor.lastName} luôn mang đến kiến thức và kỹ năng vững vàng trong mọi lần thăm khám.
                  </p>
                </div>
              </div>
            </>
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

export default DoctorProfile