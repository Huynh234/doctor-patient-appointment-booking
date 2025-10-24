import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { ButtonGroup } from 'primereact/buttongroup';
import { InputMask } from 'primereact/inputmask';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputTextarea } from 'primereact/inputtextarea';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repass: "",
    dateOfBirth: null,
    gender: "",
    contactNumber: "",
    address: "",
    city: "",
    bloodGroup: "",
    specialty: "",
    clinicLocation: "",
    licenseCode: "",
    about: "",
  };

  const [formRegister, setFormRegister] = useState(initialFormState);

  // Hàm reset form
  const resetForm = () => {
    setFormRegister(initialFormState);
  };


  const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
  ];

  const bloodGroupOptions = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
    "Other",
  ].map((bg) => ({ label: bg, value: bg }));

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormRegister((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formRegister.password !== formRegister.repass) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      const url =
        role === "doctor"
          ? "http://localhost:8080/doctors/register"
          : "http://localhost:8080/patients/register";

      const payload =
        role === "doctor"
          ? {
            firstName: formRegister.firstName,
            lastName: formRegister.lastName,
            email: formRegister.email,
            password: formRegister.password,
            contactNumber: formRegister.contactNumber,
            specialty: formRegister.specialty,
            clinicLocation: formRegister.clinicLocation,
            licenseCode: formRegister.licenseCode,
            about: formRegister.about,
          }
          : {
            firstName: formRegister.firstName,
            lastName: formRegister.lastName,
            email: formRegister.email,
            password: formRegister.password,
            contactNumber: formRegister.contactNumber,
            dateOfBirth: formRegister.dateOfBirth,
            gender: formRegister.gender,
            address: formRegister.address,
            city: formRegister.city,
            bloodGroup: formRegister.bloodGroup,
          };

      const response = await axios.post(url, payload);

      if (response.data.status) {
        toast.success("Đăng ký thành công!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-[url(https://healthworldnet.com/imagesHealthCloudBusinessofHealthHospitalsClinicshospital_800.jpg)] bg-cover py-10 ">
      <div className="mx-auto max-w-screen-md bg-white bg-opacity-90 rounded-lg shadow-lg">
        <ToastContainer />
        <div className="bg-blue-600 rounded-t-lg !w-full h-16 md:h-20 lg:h-28 flex items-center justify-center">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-1 md:mb-2 lg:mb-4">Đăng ký</h2>
            <p className="text-center text-white text-xs font-medium md:text-sm lg:text-base">Tạo tài khoản mới cho hệt thống đạt lịch phòng khám</p>
          </div>
        </div>
        <div className="ml-8 mr-8 mt-2">
          <div className="mb-4">
            <div className="flex flex-col justify-center space-y-2 mb-4 w-full">
              <div>
                <p className="block text-indigo-950 text-lg font-semibold text-center">
                  Chọn loại tài khoản
                </p>
              </div>
              <div className="flex justify-center">
                <ButtonGroup>
                  <Button
                    rounded
                    severity="info"
                    raised
                    text
                    onClick={() => setRole("patient")}
                    className={`px-4 py-2 font-bold ${role === "patient" ? "bg-sky-200 text-blue-800" : ""}`}
                  >
                    <div className="flex items-center justify-center w-28 md:w-48 lg:w-60">
                      <div className="flex flex-col">
                        <i className="pi pi-user" style={{ fontSize: '2.5rem' }}></i>
                        <span className="ml-2">Bệnh nhân</span>
                      </div>
                    </div>
                  </Button>
                  <Button
                    severity="info"
                    raised
                    rounded
                    text
                    onClick={() => setRole("doctor")}
                    className={`px-4 py-2 font-bold ${role === "doctor" ? "bg-sky-200 text-blue-800" : ""}`}
                  >
                    <div>
                      <div className="flex flex-col items-center justify-center w-28 md:w-48 lg:w-60">
                        <i className="font-extrabold text-4xl text-white">&#129658;</i>
                        <span className="ml-2">Bác sĩ</span>
                      </div>
                    </div>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
          {/* Patient Registration Form */}
          <div
            className={`mb-4 ${role === "doctor" ? "hidden" : ""}`}
          >
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="firstName">
                  Họ <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-user"> </InputIcon>
                  <InputText
                    className="!w-full"
                    id="firstName"
                    name="firstName"
                    value={formRegister.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </IconField>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="lastName">
                  Tên <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-user"> </InputIcon>
                  <InputText
                    className="!w-full"
                    id="lastName"
                    name="lastName"
                    value={formRegister.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </IconField>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="email">
                  Email <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-envelope"> </InputIcon>
                  <InputText
                    className="pl-10 w-full !text-slate-600 focus:!text-slate-600 font-normal bg-white p-3 rounded-lg border border-solid border-1 border-gray-300 focus:outline-0 focus:ring-2 focus:border-blue-500 focus:shadow-lg focus:ring-sky-200"
                    id="email"
                    name="email"
                    type="email"
                    value={formRegister.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </IconField>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="contactNumber">
                  Số điện thoại <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-phone"> </InputIcon>
                  <InputMask
                    className="w-full"
                    mask="999-999-9999" placeholder="999-99-9999"
                    id="contactNumber"
                    name="contactNumber"
                    value={formRegister.contactNumber}
                    onChange={handleInputChange}
                  />
                </IconField>
              </div>
            </div>
            <div className="flex flex-col w-full gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="password">
                  Mật khẩu <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-lock"> </InputIcon>
                  <InputText
                    className="pl-10 w-full !text-slate-600 focus:!text-slate-600 font-normal bg-white p-3 rounded-lg border border-solid border-1 border-gray-300 focus:outline-0 focus:ring-2 focus:border-blue-500 focus:shadow-lg focus:ring-sky-200"
                    id="password"
                    name="password"
                    value={formRegister.password}
                    onChange={handleInputChange}
                    type="password"
                    placeholder="Enter password"
                    required
                  />
                </IconField>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="repass">
                  Xác nhận mật khẩu <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-lock"> </InputIcon>
                  <InputText
                    className="pl-10 w-full !text-slate-600 focus:!text-slate-600 font-normal bg-white p-3 rounded-lg border border-solid border-1 border-gray-300 focus:outline-0 focus:ring-2 focus:border-blue-500 focus:shadow-lg focus:ring-sky-200"
                    id="repass"
                    name="repass"
                    value={formRegister.repass}
                    onChange={handleInputChange}
                    type="password"
                    placeholder="Enter password"
                    required
                    width="100%"
                  />
                </IconField>
              </div>
            </div>
            {/* Date of Birth + Contact Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="dateOfBirth">
                  Ngày sinh <sub className="text-red-500">*</sub>
                </label>
                <Calendar
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formRegister.dateOfBirth}
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      dateOfBirth: e.value,
                    }))
                  }
                  showIcon
                  dateFormat="yy-mm-dd"
                  placeholder="Select your birth date"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="gender">
                  Giới tính <sub className="text-red-500">*</sub>
                </label>
                <Dropdown
                  id="gender"
                  name="gender"
                  value={formRegister.gender}
                  options={genderOptions}
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      gender: e.value,
                    }))
                  }
                  placeholder="Select gender"
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Gender + Blood Group */}
            <div className="flex flex-col gap-4 mb-4">

              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="bloodGroup">
                  Nhóm máu <sub className="text-red-500">*</sub>
                </label>
                <Dropdown
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formRegister.bloodGroup}
                  options={bloodGroupOptions}
                  onChange={(e) =>
                    setFormRegister((prev) => ({
                      ...prev,
                      bloodGroup: e.value,
                    }))
                  }
                  placeholder="Select blood group"
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="flex flex-col gap-4 mb-2">
              {["address", "city"].map((field) => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="text-indigo-600 font-bold" htmlFor={field}>
                    {field === "address" ? "Địa chỉ" : "Thành phố"} <sub className="text-red-500">*</sub>
                  </label>
                  <IconField iconPosition="left">
                    <InputIcon className={field === "address" ? "pi pi-home" : "pi pi-map-marker"}> </InputIcon>
                    <InputText
                      className="!w-full"
                      id={field}
                      name={field}
                      value={formRegister[field]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${field}`}
                    />
                  </IconField>
                </div>
              ))}
            </div>
          </div>
          {/* Doctor form section */}
          <div
            className={`mb-4 ${role === "doctor" ? "" : "hidden"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Họ", name: "firstName", type: "text", icon: "pi-user" },
                { label: "Tên", name: "lastName", type: "text", icon: "pi-user" },
                { label: "Email", name: "email", type: "email", icon: "pi-envelope" },
                { label: "Số điện thoại", name: "contactNumber", type: "tel", icon: "pi-phone" },
              ].map((f) => (
                <div key={f.name} className="mb-4">
                  <label className="block text-indigo-700 text-sm font-bold mb-2">
                    {f.label}
                  </label>
                  <IconField iconPosition="left">
                    <InputIcon className={`pi ${f.icon}`}> </InputIcon>
                    <InputText
                      type={f.type}
                      name={f.name}
                      value={formRegister[f.name]}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder={`Enter ${f.label}`}
                      required
                    />
                  </IconField>
                </div>
              ))}
            </div>
            <div className="flex flex-col w-full gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="password1">
                  Mật khẩu <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-lock"> </InputIcon>
                  <InputText
                    className="pl-10 w-full !text-slate-600 focus:!text-slate-600 font-normal bg-white p-3 rounded-lg border border-solid border-1 border-gray-300 focus:outline-0 focus:ring-2 focus:border-blue-500 focus:shadow-lg focus:ring-sky-200"
                    id="password1"
                    name="password"
                    value={formRegister.password}
                    onChange={handleInputChange}
                    type="password"
                    placeholder="Enter password"
                    required
                  />
                </IconField>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-indigo-600 font-bold" htmlFor="repass1">
                  Xác nhận mật khẩu <sub className="text-red-500">*</sub>
                </label>
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-lock"> </InputIcon>
                  <InputText
                    className="w-full"
                    id="repass1"
                    name="repass"
                    value={formRegister.repass}
                    onChange={handleInputChange}
                    type="password"
                    placeholder="Enter password"
                    required
                    width="100%"
                  />
                </IconField>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Chuyên khoa", name: "specialty", type: "text", icon: "pi-briefcase" },
                { label: "Nơi làm việc / Phòng khám", name: "clinicLocation", type: "text", icon: "pi-building" },
              ].map((field) => (
                <div key={field.name} className="mb-4">
                  <label className="block text-indigo-700 text-sm font-bold mb-2">
                    {field.label} <sub className="text-red-500">*</sub>
                  </label>
                  <IconField iconPosition="left">
                    <InputIcon className={`pi ${field.icon}`}> </InputIcon>
                    <InputText
                      type={field.type}
                      name={field.name}
                      value={formRegister[field.name]}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder={`Enter ${field.label}`}
                      required
                    />
                  </IconField>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-indigo-600 font-bold" htmlFor="code">
                Mã chứng chỉ hành nghề <sub className="text-red-500">*</sub>
              </label>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-credit-card"> </InputIcon>
                <InputText
                  className="pl-10 w-full !text-slate-600 focus:!text-slate-600 font-normal bg-white p-3 rounded-lg border border-solid border-1 border-gray-300 focus:outline-0 focus:ring-2 focus:border-blue-500 focus:shadow-lg focus:ring-sky-200"
                  id="code"
                  name="licenseCode"
                  value={formRegister.licenseCode}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </IconField>
            </div>
            <div className="mb-2">
              <label className="block text-indigo-700 text-sm font-bold mb-2">
                Giới thiệu
              </label>
              <InputTextarea
                name="about"
                value={formRegister.about}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>
          </div>
        </div>
        <div className="ml-6 mr-6">
          <div className="text-center">
            <Button
              type="submit"
              onClick={handleSubmit}
              label="Đăng ký"
              icon="pi pi-user-plus"
              loading={isLoading}
              className="bg-indigo-600 border-none hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none mt-6 w-full transform hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          </div>
          <div className="text-center mt-4">
            <span className="text-black">Already registered?</span>{" "}
            <Link to="/login" className="text-indigo-700 font-bold">
              Login here.
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegistrationForm;
