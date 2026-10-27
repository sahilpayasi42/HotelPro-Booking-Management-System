import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports').then(r => setReports(r.data.reports)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!reports) return <div className="container py-4"><div className="alert alert-danger">Failed to load reports.</div></div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Reports & Analytics</h2>
      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm"><div className="card-body">
            <h5>Bookings & Revenue by Month</h5>
            {reports.bookingsByMonth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={reports.bookingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis yAxisId="left" /><YAxis yAxisId="right" orientation="right" />
                  <Tooltip /><Legend />
                  <Line yAxisId="left" type="monotone" dataKey="count" stroke="#0088FE" name="Bookings" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#00C49F" name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">No data yet.</p>}
          </div></div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm"><div className="card-body">
            <h5>Booking Status Distribution</h5>
            {reports.statusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={reports.statusDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ _id, count }) => `${_id}: ${count}`}>
                    {reports.statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">No data yet.</p>}
          </div></div>
        </div>
        <div className="col-12 mb-4">
          <div className="card shadow-sm"><div className="card-body">
            <h5>Revenue by Room Category</h5>
            {reports.revenueByCategory?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reports.revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₹)" />
                  <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted">No data yet.</p>}
          </div></div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
