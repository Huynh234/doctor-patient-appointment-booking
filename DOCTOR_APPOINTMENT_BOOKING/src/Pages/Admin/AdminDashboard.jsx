import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { Chip } from 'primereact/chip';
import { TabMenu } from 'primereact/tabmenu';
import { AuthContext } from "../../Context/AuthContext";
import newLogo from '../../assets/Logo_Medbooking.png';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [contact, setContact] = useState("");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const items = [
    { label: 'Quản lý người dùng', icon: 'pi pi-users' },
  ];

  // Options cho Dropdown
  const typeOptions = [
    { label: "Tất cả", value: null },
    { label: "Bác sĩ", value: "doctor" },
    { label: "Bệnh nhân", value: "patient" },
  ];

  const statusOptions = [
    { label: "Tất cả", value: null },
    { label: "Đang hoạt động", value: true },
    { label: "Đã khóa", value: false },
  ];

  const fetchUsers = async () => {
    try {
      const params = {
        page,
        limit: rows,
        sort: "desc",
      };

      if (contact && contact.trim() !== "") {
        params.contact = contact.trim();
      }

      if (type && type !== "") {
        params.type = type;
      }

      if (status !== null && status !== undefined && status !== "") {
        params.status = status;
      }

      const response = await axios.get("http://localhost:8080/admin/allusers", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(response.data.users);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const op = [
    { label: 'Khóa', value: false },
    { label: 'Mở khóa', value: true }
  ];

  const auth = (rowData) => (
    <SelectButton
      value={rowData.status}
      options={op}
      onChange={(e) => updateStatus(rowData, e.value)}
    />
  );

  const op2 = [
    { label: 'Từ chối', value: false },
    { label: 'Phê duyệt', value: true }
  ];

  const Appove = (rowData) => (
    rowData.approve == null ? <Chip label="Bệnh nhân" className="bg-blue-100 text-blue-700" /> :
      <SelectButton
        value={rowData.approve}
        options={op2}
        onChange={(e) => updateAppove(rowData, e.value)}
      />
  );

  const updateAppove = async (r, v) => {
    try {
      await axios.patch(
        'http://localhost:8080/admin/approve-doctor',
        {
          doctorId: r.id,
          approve: v
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Update approval failed:", err);
    }
  };

  const updateStatus = async (r, v) => {
    try {
      await axios.patch(
        'http://localhost:8080/admin/toggle-user-status',
        {
          userType: r.userType,
          userId: r.id,
          status: v
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      fetchUsers();
    } catch (err) {
      console.error("Update status failed:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [contact, type, status, page, rows]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Header */}
      <header className="card bg-white fixed top-0 w-full z-10 flex justify-between items-center box-border shadow-md">
        <div className="flex w-full">
          <div className="flex ml-8 items-center justify-start">
            <div>
              <img src={newLogo} alt="Logo" className="mx-auto md:w-16 lg:w-20" />
            </div>
            <div className="flex flex-col ml-7 text-left">
              <div>
                <p className="md:text-xl lg:text-3xl text-blue-500 font-bold">MedBooking</p>
              </div>
              <div>
                <span className="text-gray-600 md:text-sm lg:text-base">Hệ thống quản trị</span>
              </div>
            </div>
          </div>
          <div className="lg:flex-1"></div>
          <div className="flex bottom-0 justify-end items-center mr-8">
            <div className="h-full flex items-end">
              <TabMenu 
                model={items} 
                activeIndex={activeIndex} 
                onTabChange={(e) => setActiveIndex(e.index)} 
                className="lg:text-base md:text-sm" 
              />
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded-full focus:outline-none focus:shadow-outline-red active:bg-red-800 transform hover:scale-105 transition-transform duration-300 ease-in-out ml-4 flex items-center"
              onClick={handleLogout}
            >
              <i className="pi pi-sign-out mr-2" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-24 min-h-screen bg-gray-50 flex flex-col items-center w-full">
        {activeIndex === 0 && (
          <div className="flex flex-col items-center mb-12 mt-16 w-full">
            <div className="card w-11/12 bg-white shadow-lg rounded-lg p-6">
              <div className="m-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  Quản lý người dùng
                </h2>
                <p className="text-gray-600 mt-2">Quản lý thông tin bác sĩ và bệnh nhân trong hệ thống</p>
              </div>

              {/* Bộ lọc */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                    <InputText
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Email hoặc số điện thoại"
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Loại người dùng</label>
                    <Dropdown
                      value={type}
                      onChange={(e) => setType(e.value)}
                      options={typeOptions}
                      optionLabel="label"
                      placeholder="Chọn loại"
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <Dropdown
                      value={status}
                      onChange={(e) => setStatus(e.value)}
                      options={statusOptions}
                      optionLabel="label"
                      placeholder="Chọn trạng thái"
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button 
                      label="Đặt lại bộ lọc" 
                      icon="pi pi-refresh"
                      onClick={() => { 
                        setContact(""); 
                        setType(null); 
                        setStatus(null); 
                        setPage(1); 
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* DataTable */}
              <DataTable
                value={users}
                paginator
                rows={rows}
                totalRecords={totalRecords}
                first={(page - 1) * rows}
                onPage={(e) => {
                  setPage(e.page + 1);
                  setRows(e.rows);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: "50rem" }}
                responsiveLayout="scroll"
                stripedRows
                className="custom-datatable"
              >
                <Column field="name" header="Tên" style={{ width: "12%" }} />
                <Column field="email" header="Email" style={{ width: "15%" }} />
                <Column field="contactNumber" header="Số điện thoại" style={{ width: "10%" }} />
                <Column field="userType" header="Loại" style={{ width: "8%" }} />
                <Column field="createdAt" header="Thời gian" style={{ width: "12%" }} />
                <Column field="specialty" header="Chuyên ngành" style={{ width: "12%" }} />
                <Column field="status" header="Trạng thái" style={{ width: "15%" }} body={auth} />
                <Column field="approve" header="Phê duyệt" style={{ width: "16%" }} body={Appove} />
              </DataTable>
            </div>
          </div>
        )}


      </main>

      <Footer/>
    </>
  );
};

export default AdminDashboard;