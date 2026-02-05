import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => {
      setStats(res.data);
    });
  }, []);

  return (
    <AdminLayout>
      {!stats ? (
        <div className="dashboard-loading">Loading dashboard…</div>
      ) : (
        <>
          {/* Page Header */}
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Overview of users and check-in activity</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
            />
            <StatCard
              title="Active Check-ins"
              value={stats.activeCheckins}
            />
            <StatCard
              title="Paused Check-ins"
              value={stats.pausedCheckins}
            />
            <StatCard
              title="Alerts Today"
              value={stats.alertsToday}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}
