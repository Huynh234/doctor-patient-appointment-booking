import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { Chip } from 'primereact/chip';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [contact, setContact] = useState("");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  // Options cho Dropdown
  const typeOptions = [
    { label: "All", value: null },
    { label: "Doctor", value: "doctor" },
    { label: "Patient", value: "patient" },
  ];

  const statusOptions = [
    { label: "All", value: null },
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const fetchUsers = async () => {
    try {
      // Tạo object params chỉ chứa những field có giá trị
      const params = {
        page,
        limit: rows,
        sort: "desc", // nếu muốn mặc định desc
      };

      if (contact && contact.trim() !== "") {
        params.contact = contact.trim();
      }

      if (type && type !== "") {
        params.type = type;
      }

      if (status !== null && status !== undefined && status !== "") {
        params.status = status; // gửi số 0 hoặc 1
      }

      const response = await axios.get("http://localhost:8080/admin/allusers", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT nếu dùng
        },
      });

      setUsers(response.data.users);
      setTotalRecords(response.data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
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
    rowData.approve == null ? <Chip label="Bệnh nhân" /> :
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

      // Sau khi cập nhật → load lại danh sách
      fetchUsers();

    } catch (err) {
      console.error("Update status failed:", err);
    }
  }

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

      // Sau khi cập nhật → load lại danh sách
      fetchUsers();

    } catch (err) {
      console.error("Update status failed:", err);
    }
  }



  // Gọi API khi load trang hoặc filter/page/rows thay đổi
  useEffect(() => {
    fetchUsers();
  }, [contact, type, status, page, rows]);

  return (
    <div className="card p-4">
      <h2 className="mb-4">User Management</h2>

      {/* Bộ lọc */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <InputText
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Search by email or contact"
          className="w-full md:w-20rem"
        />

        <Dropdown
          value={type}
          onChange={(e) => setType(e.value)}
          options={typeOptions}
          optionLabel="label"
          placeholder="Select Type"
          className="w-full md:w-14rem"
        />

        <Dropdown
          value={status}
          onChange={(e) => setStatus(e.value)}
          options={statusOptions}
          optionLabel="label"
          placeholder="Select Status"
          className="w-full md:w-14rem"
        />

        <Button label="Reset Filters" onClick={() => { setContact(""); setType(null); setStatus(null); setPage(1); }} />
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
      >
        <Column field="name" header="Tên" style={{ width: "10%" }} />
        <Column field="email" header="Email" style={{ width: "10%" }} />
        <Column field="contactNumber" header="Số điện thoại" style={{ width: "8%" }} />
        <Column field="userType" header="loại" style={{ width: "3%" }} />
        <Column field="createdAt" header="Thời gian" style={{ width: "10%" }} />
        <Column field="specialty" header="Chuyên ngành" style={{ width: "10%" }} />
        <Column field="status" header="Trạng thái" style={{ width: "15%" }} body={auth} />
        <Column field="approve" header="Phê duyệt" style={{ width: "15%" }} body={Appove} />
      </DataTable>
    </div>
  )
}

export default AdminDashboard