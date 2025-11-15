import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div className="bg-blue-500 py-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-28 text-white">
          {[
            { title: "Về MedBooking", description: ["Giới thiệu", "Điều khoản sử dụng", "Chính sách sử dụng", "Quy trình bảo mật"] },
            { title: "Dịch vụ", description: ["Đặt lịch khám bệnh", "Tư vấn sức khỏe", "Quản lý hồ sơ bệnh án", "Tra cứu kết quả sức khỏe"] },
          ].map((item, index) => (
            <div key={index} className="">
              <div >
                <div className=" border-b-2 border-white border-solid">
                  <h3 className="text-xl font-bold m-2">{item.title}</h3>
                </div>
                <ul>
                  {item.description.map((desc, descIndex) => (
                    <li key={descIndex} className="m-2">{desc}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          <div>
            <div className=" border-b-2 border-white border-solid">
              <h3 className="text-xl font-bold m-2">Liên hệ</h3>
            </div>
            <ul>
              <li className="flex items-center m-2">
                <i className="pi pi-map-marker"></i>
                <p> Cầu Giấy, Hà Nội</p>
              </li>
              <li className="flex items-center m-2">
                <i className="pi pi-phone"></i>
                <p>+84 123 456 789</p>
              </li>
              <li className="flex items-center m-2">
                <i className="pi pi-envelope"></i>
                <p> stu725105091@gmail.com</p>
              </li>
              <li className="flex items-center m-2">
                <i className="pi pi-globe"></i>
                <p> https://medbooking.aerin2412.id.vn/</p>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <hr className="text-white mt-2" />
          <p className="text-center text-white mt-1">© 2025 MedBooking - Hệ thống đặt lịch khám bệnh trực tuyến</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
