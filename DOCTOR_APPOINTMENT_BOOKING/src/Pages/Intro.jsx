import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Heart, CheckCircle, Star, ArrowRight, Shield, Smartphone, Zap } from 'lucide-react';
import Footer from "../components/Footer";
import logo from "../assets/Logo_Medbooking.png"
import { useNavigate } from "react-router-dom";
const MedBookingLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const forCusEl = () => {
    window.scrollTo({
      top: 750,
      behavior: 'smooth'
    });
  };

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Đặt lịch 24/7",
      description: "Đặt lịch khám bất cứ lúc nào, mọi lúc mọi nơi chỉ với vài thao tác đơn giản"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Tiết kiệm thời gian",
      description: "Không còn xếp hàng chờ đợi, lịch hẹn được xác nhận ngay lập tức"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Tìm bác sĩ phù hợp",
      description: "Tìm kiếm và lựa chọn bác sĩ theo chuyên khoa, kinh nghiệm và đánh giá"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bảo mật tuyệt đối",
      description: "Thông tin y tế của bạn được bảo vệ an toàn theo tiêu chuẩn quốc tế"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Giao diện thân thiện",
      description: "Thiết kế hiện đại, dễ sử dụng cho mọi lứa tuổi"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Cập nhật realtime",
      description: "Nhận thông báo ngay lập tức về trạng thái lịch hẹn của bạn"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Bệnh nhân tin dùng" },
    { number: "500+", label: "Bác sĩ chuyên khoa" },
    { number: "50+", label: "Cơ sở y tế" },
    { number: "95%", label: "Hài lòng dịch vụ" }
  ];

  const steps = [
    {
      step: "01",
      title: "Đăng ký tài khoản",
      description: "Tạo tài khoản miễn phí chỉ trong 30 giây"
    },
    {
      step: "02",
      title: "Tìm bác sĩ phù hợp",
      description: "Tìm kiếm theo chuyên khoa và xem lịch trống"
    },
    {
      step: "03",
      title: "Đặt lịch khám",
      description: "Chọn thời gian phù hợp và xác nhận"
    },
    {
      step: "04",
      title: "Nhận xác nhận",
      description: "Nhận thông báo xác nhận và nhắc lịch tự động"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {navigate("/")}}>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <img src={logo} alt="Logo" className="mx-auto md:w-16 lg:w-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">MedBooking</h1>
              <p className="text-xs text-gray-600">Hệ thống đặt lịch khám trực tuyến</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-full transition-all duration-300" onClick={() => {navigate("/login")}}>
              Đăng nhập
            </button>
            <button onClick={() => {navigate("/register")}} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            🏥 Chuyển đổi số Y tế 4.0
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Đặt lịch khám bệnh<br />
            <span className="text-blue-600">Dễ dàng & Nhanh chóng</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Kết nối bạn với các bác sĩ chuyên khoa hàng đầu. Đặt lịch trực tuyến, tiết kiệm thời gian, nâng cao trải nghiệm chăm sóc sức khỏe.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => {navigate("/login")}} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2">
              Đặt lịch ngay <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={forCusEl} className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn MedBooking?</h2>
            <p className="text-xl text-gray-600">Giải pháp toàn diện cho nhu cầu chăm sóc sức khỏe của bạn</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cách thức hoạt động</h2>
            <p className="text-xl text-gray-600">Chỉ 4 bước đơn giản để đặt lịch khám</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="text-5xl font-bold text-blue-100 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

       <Footer/>
    </div>
  );
};

export default MedBookingLanding;