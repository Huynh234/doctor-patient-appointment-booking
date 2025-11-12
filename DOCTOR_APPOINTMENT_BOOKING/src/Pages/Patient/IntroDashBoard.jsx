import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
const IntroDashBoard = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 m-4 w-full md:w-4/5 lg:w-3/5">
                <h1 className="lg:text-5xl md:text-2xl text-blue-500 font-bold mb-4 text-center text-xl">Chào mừng đến với MedBooking</h1>
                <p className="text-lg text-gray-600 text-center">MedBooking là nền tảng đặt lịch khám bệnh trực tuyến hàng đầu, giúp bạn dễ dàng kết nối với các
                    bác sĩ và cơ sở y tế uy tín.</p>
                <p className="text-center text-gray-600">Với giao diện thân thiện và quy trình đặt lịch đơn giản, chúng tôi cam kết mang đến trải nghiệm tốt
                    nhất cho sức khỏe của bạn và gia đình.</p>
            </div>
            <div className="mt-10 w-full flex justify-center mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-4/5" >
                {[{ title: "Đặt lịch nhanh chóng", header: <Button icon="pi pi-calendar" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Chỉ với vài thao tác đơn giản, bạn có thể đặt lịch khám với bác sĩ chuyên khoa phù hợp trong vài phút." },
                { title: "Bác sĩ chuyên nghiệp", header: <Button icon="pi pi-users" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Hệ thống bác sĩ đa chuyên khoa với trình độcao, giàu kinh nghiệm và tận tâm với bệnh nhân." },
                { title: "An toàn & bảo mật", header: <Button icon="pi pi-check-circle" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Thông tin cá nhân và hồ sơ bệnh án của bạnđược bảo mật tuyệt đối theo tiêu chuẩn quốc tế." },
                { title: "tiết kiệm thời gian", header: <Button icon="pi pi-clock" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Không cần xếp hàng chờ đợi, bạn có thể quản lý lịch khám và nhận thông báo nhắc nhở tự động." },
                { title: "Hỗ trợ 24/7", header: <Button icon="pi pi-whatsapp" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi qua hotline và chat trực tuyến." },
                { title: "Mạng lưới rộng khắp", header: <Button icon="pi pi-map-marker" rounded severity="info" aria-label="User" className="m-5" size="large" /> , detail:"Kết nối với hàng trăm bệnh viện, phòng khám uy tín trên toàn quốc, giúp bạn dễ dàng tìm kiếm địa điểm phù hợp." }
                ].map((item, index) => (
                    <Card key={index} title={item.title} header={item.header} className="md:w-25rem p-5">
                        <p className="m-0">
                            <p className="m-0">
                                {item.detail}
                            </p>
                        </p>
                    </Card>
                ))}
            </div>
            </div>
        </div>

    );
};

export default IntroDashBoard;