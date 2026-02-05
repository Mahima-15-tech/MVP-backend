import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => {
        setUsers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="users-header">
        <h1>Users</h1>
        <p>All registered users in the system</p>
      </div>

      {loading ? (
        <div className="users-loading">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="users-empty">No users found</div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Language</th>
                <th>Alert Voice</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "—"}</td>
                  <td>{user.phone}</td>
                  <td>{user.language || "—"}</td>
                  <td>{user.alertVoice || "—"}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
