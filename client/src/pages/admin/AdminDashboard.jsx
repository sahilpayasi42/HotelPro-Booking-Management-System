import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Refined hospitality chart color palette
const CHART_COLORS = ['#0f172a', '#0d9488', '#c59b27', '#6366f1', '#64748b', '#059669'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([API.get('/admin/stats'), API.get('/admin/reports')]);
        setStats(s.data.stats);
        setReports(r.data.reports);
      } catch {
        /* handled gracefully */
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      iconBg: '#f1f5f9',
      iconColor: '#0f172a',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      label: 'Total Rooms',
      value: stats?.totalRooms || 0,
      iconBg: '#f0fdfa',
      iconColor: '#0d9488',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 21h18M3 7v14M21 7v14M6 3h12a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2z"></path>
          <path d="M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2"></path>
        </svg>
      ),
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      iconBg: '#eef2ff',
      iconColor: '#4338ca',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      label: 'Gross Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      iconBg: '#fef7e6',
      iconColor: '#b0871d',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
    },
    {
      label: 'Occupancy Rate',
      value: `${stats?.occupancyRate || 0}%`,
      iconBg: '#fff7ed',
      iconColor: '#c2410c',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 12A10 10 0 1 1 12 2v10z"></path>
          <path d="M12 2A10 10 0 0 1 22 12h-10z"></path>
        </svg>
      ),
    },
  ];

  const managementLinks = [
    {
      to: '/admin/rooms',
      title: 'Room Inventory',
      desc: 'Room numbers, status & nightly tariffs',
      icon: '🚪',
    },
    {
      to: '/admin/categories',
      title: 'Room Categories',
      desc: 'Suites, capacities & curated amenities',
      icon: '📁',
    },
    {
      to: '/admin/bookings',
      title: 'Reservations',
      desc: 'Active, completed & upcoming stays',
      icon: '📋',
    },
    {
      to: '/admin/payments',
      title: 'Financial Audits',
      desc: 'Payment logs, invoices & methods',
      icon: '💳',
    },
    {
      to: '/admin/users',
      title: 'Guest Accounts',
      desc: 'Customer profiles, history & roles',
      icon: '👥',
    },
    {
      to: '/admin/staff',
      title: 'Staff Management',
      desc: 'Shift assignments & hotel departments',
      icon: '👷',
    },
    {
      to: '/admin/reports',
      title: 'Analytics & Reports',
      desc: 'Financial velocity & occupancy graphs',
      icon: '📊',
    },
  ];

  return (
    <div className="container py-4">
      {/* ─── Dashboard Header ───────────────────────────────── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">Operations &amp; Admin Dashboard</h2>
            <span
              className="badge px-2 py-1 rounded-pill"
              style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: '0.75rem',
              }}
            >
              ● System Live
            </span>
          </div>
          <p className="text-muted small mb-0">
            Awas360 Hospitality Suite • Real-time overview of occupancy, guests &amp; financial performance.
          </p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/admin/reports" className="btn btn-outline-primary btn-sm">
            View Full Reports
          </Link>
          <Link to="/admin/rooms" className="btn btn-primary btn-sm">
            Manage Rooms
          </Link>
        </div>
      </div>

      {/* ─── Statistics Cards ───────────────────────────────── */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg">
            <div className="admin-stat-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="stat-title">{card.label}</span>
                <div
                  className="stat-icon-box"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  {card.icon}
                </div>
              </div>
              <div className="stat-number">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Section ─────────────────────────────────── */}
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Monthly Booking &amp; Revenue Trends</h5>
                <span className="text-muted small">Realized Totals</span>
              </div>

              {reports?.bookingsByMonth?.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={reports.bookingsByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '12px' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#0f172a"
                      radius={[4, 4, 0, 0]}
                      name="Bookings"
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#0d9488"
                      radius={[4, 4, 0, 0]}
                      name="Revenue (₹)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p className="small mb-0">No booking telemetry recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 shadow-sm border">
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Reservation Status</h5>
                <span className="text-muted small">Distribution</span>
              </div>

              {reports?.statusDistribution?.length > 0 ? (
                <div className="flex-grow-1 d-flex flex-column justify-content-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={reports.statusDistribution}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {reports.statusDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {reports.statusDistribution.map((item, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center gap-1 small text-secondary px-2 py-1 rounded"
                        style={{ backgroundColor: '#f8fafc', fontSize: '0.78rem' }}
                      >
                        <span
                          className="rounded-circle"
                          style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                          }}
                        ></span>
                        <span className="text-capitalize">{item._id}:</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted my-auto">
                  <p className="small mb-0">No status records to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Operations Management Grid ─────────────────────── */}
      <div className="mb-2">
        <h5 className="fw-bold mb-1">Administrative Operations</h5>
        <p className="text-muted small mb-3">Access and manage all hotel divisions, records, and services.</p>
      </div>

      <div className="row g-3">
        {managementLinks.map((link, idx) => (
          <div key={idx} className="col-12 col-md-6 col-lg-3">
            <Link
              to={link.to}
              className="card h-100 text-decoration-none border shadow-sm p-3 card-hover"
              style={{ transition: 'all 0.2s ease', backgroundColor: '#ffffff' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '1.25rem',
                  }}
                >
                  {link.icon}
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <h6 className="fw-bold text-dark mb-1 text-truncate">{link.title}</h6>
                  <p className="text-muted small mb-0 text-truncate" style={{ fontSize: '0.78rem' }}>
                    {link.desc}
                  </p>
                </div>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>→</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
