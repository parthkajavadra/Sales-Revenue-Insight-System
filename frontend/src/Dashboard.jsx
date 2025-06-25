import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    product: '',
    region: '',
    from: '',
    to: ''
  });

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams(filters).toString();

    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/sales/analytics/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setError('');
    } catch {
      setError('❌ Failed to load analytics data.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchData();
  };

  const resetFilters = () => {
    const cleared = { product: '', region: '', from: '', to: '' };
    setFilters(cleared);
    setTimeout(fetchData, 0);
  };

  const downloadWithAuth = async (url, filename) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return alert('❌ Download failed: ' + res.statusText);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div className="alert alert-danger text-center mt-4">{error}</div>;
  if (!data) return <div className="text-center mt-4">⏳ Loading dashboard...</div>;

  return (
    <div className="container mt-5">
      {/* Filters */}
      <form className="row g-3 mb-4" onSubmit={applyFilters}>
        <div className="col-md-2">
          <input name="product" value={filters.product} onChange={handleFilterChange} className="form-control" placeholder="Product" />
        </div>
        <div className="col-md-2">
          <input name="region" value={filters.region} onChange={handleFilterChange} className="form-control" placeholder="Region" />
        </div>
        <div className="col-md-2">
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="form-control" />
        </div>
        <div className="col-md-2">
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="form-control" />
        </div>
        <div className="col-md-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary w-100">Apply</button>
          <button type="button" onClick={resetFilters} className="btn btn-secondary w-100">Reset</button>
        </div>
      </form>

      {/* Export */}
      <div className="mb-4 text-end">
        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => downloadWithAuth(`http://127.0.0.1:8000/api/sales/export/csv/`, 'sales_data.csv')}>Export CSV</button>
        <button className="btn btn-outline-danger btn-sm" onClick={() => downloadWithAuth(`http://127.0.0.1:8000/api/sales/export/pdf/`, 'sales_report.pdf')}>Export PDF</button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card text-white bg-primary mb-3 text-center">
            <div className="card-body">
              <h5>Total Revenue</h5>
              <h3>₹{data.total_revenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-white bg-success mb-3 text-center">
            <div className="card-body">
              <h5>Total Quantity Sold</h5>
              <h3>{data.total_quantity}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <h4 className="text-center mb-4">📊 Sales Insights</h4>

      <div className="mb-5">
        <h5>📆 Revenue Over Time</h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.sales_over_time}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-5">
        <h5>🏆 Top Products by Revenue</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.top_products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-5">
        <h5>🌍 Sales by Region</h5>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.sales_by_region} dataKey="total" nameKey="region" outerRadius={120} label>
              {data.sales_by_region.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
