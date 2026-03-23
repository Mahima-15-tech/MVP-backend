import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminManagement() {

  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const fetchAdmins = () => {
    api.get("/admin/admins").then(res => {
      setAdmins(res.data);
    });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    try {
      await api.post("/admin/admins", form);
      alert("Admin created successfully");
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await api.delete(`/admin/admins/${id}`);
    fetchAdmins();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">

      <h3 className="text-xl font-semibold text-gray-800">
        Admin Management
      </h3>

      {/* CREATE ADMIN */}
      <div className="grid grid-cols-3 gap-6">
        <input
          type="text"
          placeholder="Name"
          className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 outline-none"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
      </div>

      <button
        onClick={createAdmin}
        className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 hover:shadow-lg transition"
      >
        Create Admin
      </button>

      {/* ADMIN LIST */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium mb-4 text-gray-800">
          Existing Admins
        </h4>

        <div className="space-y-3">
          {admins.map(admin => (
            <div
              key={admin._id}
              className="flex justify-between items-center border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {admin.name}
                </p>
                <p className="text-sm text-gray-500">
                  {admin.email}
                </p>

                <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  {admin.role}
                </span>
              </div>

              {admin.role !== "SUPER_ADMIN" && (
                <button
                  onClick={() => deleteAdmin(admin._id)}
                  className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      

    </div>
  );
}