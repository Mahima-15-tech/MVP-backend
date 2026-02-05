import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";
import AlertModal from "../components/AlertModal";


export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    api.get("/admin/alerts")
      .then((res) => {
        setAlerts(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="alerts-header">
        <h1>Alerts</h1>
        <p>All triggered alerts in the system</p>
      </div>

      {loading ? (
        <div className="alerts-loading">Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="alerts-empty">No alerts found</div>
      ) : (
        <div className="table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Location</th>
                <th>Triggered At</th>
              </tr>
            </thead>
            <tbody>
  {alerts.map((alert) => (
    <tr
      key={alert._id}
      onClick={() => setSelectedAlert(alert)}
      style={{ cursor: "pointer" }}
    >
      <td>{alert.userId?.name || "—"}</td>
      <td>{alert.userId?.phone || "—"}</td>
      <td>{alert.type}</td>
      <td>
        {alert.location?.lat
          ? `${alert.location.lat}, ${alert.location.lng}`
          : "—"}
      </td>
      <td>{new Date(alert.createdAt).toLocaleString()}</td>
    </tr>
  ))}
</tbody>


          </table>
        </div>
      )}

{selectedAlert && (
  <AlertModal
    alert={selectedAlert}
    onClose={() => setSelectedAlert(null)}
  />
)}

    </AdminLayout>

    
  );
}
