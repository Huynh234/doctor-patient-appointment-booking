import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../Context/AuthContext";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ButtonGroup } from "primereact/buttongroup";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { FaUserMd } from 'react-icons/fa';
const Login = () => {
  const history = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient"
  });
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = (value) => {
    setFormData({
      email: "",
      password: "",
      role: value,
    });
  };

  const handleRoleChange = (dataValue) => {
    // setFormData({ ...formData, role: dataValue });
    resetForm(dataValue);
    console.log(formData);
  };

  const handleLogin = async (e) => {
    // Nếu muốn vẫn hỗ trợ form submit, giữ dòng này:
    e?.preventDefault?.();

    setIsLoading(true);
    try {
      const response = await axios.post(
        formData.role === "admin" ? `http://localhost:8080/admin/login` : `http://localhost:8080/${formData.role}s/login`,
        formData
      );

      if (response.data.status) {
        toast.success("Login successful!");
        localStorage.setItem("token", response.data.token);
        formData.role !== "admin" && localStorage.setItem("userId", response.data.user.patientId || response.data.user.doctorId );

        if (formData.role === "patient") {
          history("/patient-dashboard");
        } else if (formData.role === "doctor") {
          history("/doctor-dashboard");
        } else if (formData.role === "admin") {
          history("/admin-dashboard");
        }

        login();
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(
        "An error occurred while logging in. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-[url(https://healthworldnet.com/imagesHealthCloudBusinessofHealthHospitalsClinicshospital_800.jpg)] 
     bg-cover py-10 min-h-screen flex justify-center items-center">
      <div className="bg-opacity-95 bg-white backdrop-blur-xl w-full max-w-2xl rounded-lg shadow-lg">
        <div className="bg-indigo-600 rounded-t-lg !w-full h-16 md:h-20 lg:h-28 flex items-center justify-center">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-1 md:mb-2 lg:mb-4">Đăng nhập hệ thống</h2>
            <p className="text-center text-white text-xs font-medium md:text-sm lg:text-base">Đăng nhập vào hệ thống đặt lịch khám trực tuyến</p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <div>
            <div className="mb-4 text-center">
              <p className="text-indigo-700 font-medium text-xl">Chọn loại tài khoản</p>
            </div>
            <div>
              <ButtonGroup>
                <Button
                  rounded
                  severity="info"
                  raised
                  text
                  onClick={() => handleRoleChange("patient")}
                  className={`px-4 py-2 font-bold ${formData.role === "patient" ? "bg-sky-200 text-blue-800" : ""
                    }`}
                >
                  <div className="flex flex-col items-center justify-center w-20 md:w-32 lg:w-44">
                    <i className="pi pi-user" style={{ fontSize: "2.5rem" }}></i>
                    <span className="mt-1 text-sm md:text-base lg:text-lg">Bệnh nhân</span>
                  </div>
                </Button>
                <Button
                  severity="info"
                  raised
                  rounded
                  text
                  onClick={() => handleRoleChange("doctor")}
                  className={`px-4 py-2 font-bold ${formData.role === "doctor" ? "bg-sky-200 text-blue-800" : ""
                    }`}
                >
                  <div className="flex flex-col items-center justify-center w-20 md:w-32 lg:w-44">
                     <FaUserMd className="text-4xl" />
                    <span className="mt-1 text-sm md:text-base lg:text-lg">Bác sĩ</span>
                  </div>
                </Button>

                <Button
                  rounded
                  severity="info"
                  raised
                  text
                  onClick={() => handleRoleChange("admin")}
                  className={`px-4 py-2 font-bold ${formData.role === "admin" ? "bg-sky-200 text-blue-800" : ""
                    }`}
                >
                  <div className="flex flex-col items-center justify-center w-20 md:w-32 lg:w-44">
                    <i className="pi pi-shield" style={{ fontSize: "2.5rem" }}></i>
                    <span className="mt-1 text-sm md:text-base lg:text-lg">Admin</span>
                  </div>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 lg:p-10">
          <div>
            <div className="mb-4">
              <label className="block text-indigo-700 text-sm font-bold mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-envelope" ></InputIcon>
                  <InputText
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Nhập email"
                    required
                  />
              </IconField>
            </div>
            <div className="mb-4">
              <label className="block text-indigo-700 text-sm font-bold mb-2">
                Mật khẩu<span className="text-red-500">*</span>
              </label>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-lock" ></InputIcon>
                  <InputText
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Nhập mật khẩu"
                    required
                  />
              </IconField>
            </div>
            <div className="text-center">
              <Button
                label={isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                type="submit"
                onClick={handleLogin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline-indigo active:bg-indigo-800 mt-10 w-full transform hover:scale-105 transition-transform duration-300 ease-in-out"
                disabled={isLoading}
              />

            </div>
            <div className="text-center mt-4">
              Bạn chưa có tài khoản?{" "}
              <Link to="/" className="text-indigo-700 font-bold hover:underline">
                Đăng ký tại đây.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
