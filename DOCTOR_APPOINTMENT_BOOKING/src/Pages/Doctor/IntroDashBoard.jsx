import React from "react";

const IntroDoctorDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-12 mb-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Bảng điều khiển Bác sĩ</h1>
        <p className="text-xl mb-6">Quản lý lịch khám và chăm sóc bệnh nhân hiệu quả</p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-calendar text-blue-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Quản lý Lịch hẹn</h3>
          </div>
          <p className="text-gray-600">
            Xem và quản lý tất cả các cuộc hẹn của bạn. Cập nhật trạng thái, xác nhận hoặc hủy lịch hẹn dễ dàng.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-users text-green-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Thông tin Bệnh nhân</h3>
          </div>
          <p className="text-gray-600">
            Truy cập thông tin chi tiết về bệnh nhân, lịch sử khám bệnh và ghi chú quan trọng.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-chart-line text-purple-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Thống kê</h3>
          </div>
          <p className="text-gray-600">
            Xem báo cáo và thống kê về số lượng bệnh nhân, lịch hẹn và hiệu suất công việc.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-bell text-orange-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Thông báo Real-time</h3>
          </div>
          <p className="text-gray-600">
            Nhận thông báo ngay lập tức khi có lịch hẹn mới hoặc thay đổi từ bệnh nhân.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-user-edit text-red-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Hồ sơ Cá nhân</h3>
          </div>
          <p className="text-gray-600">
            Cập nhật thông tin cá nhân, chuyên môn, giờ làm việc và địa điểm phòng khám.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-4">
            <i className="pi pi-shield text-indigo-600 text-4xl mr-4"></i>
            <h3 className="text-xl font-semibold">Bảo mật</h3>
          </div>
          <p className="text-gray-600">
            Hệ thống đảm bảo an toàn dữ liệu bệnh nhân và tuân thủ các quy định về bảo mật y tế.
          </p>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="bg-blue-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Hướng dẫn Sử dụng</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
            <div>
              <h4 className="font-semibold text-lg mb-2">Cập nhật Hồ sơ</h4>
              <p className="text-gray-700">Vào tab "Hồ sơ của tôi" để cập nhật thông tin cá nhân, chuyên môn và giờ làm việc.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
            <div>
              <h4 className="font-semibold text-lg mb-2">Quản lý Lịch hẹn</h4>
              <p className="text-gray-700">Vào tab "Quản lý lịch khám" để xem danh sách lịch hẹn, cập nhật trạng thái và quản lý cuộc hẹn.</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
            <div>
              <h4 className="font-semibold text-lg mb-2">Nhận Thông báo</h4>
              <p className="text-gray-700">Hệ thống sẽ tự động cập nhật khi có lịch hẹn mới hoặc thay đổi từ bệnh nhân.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default IntroDoctorDashboard;