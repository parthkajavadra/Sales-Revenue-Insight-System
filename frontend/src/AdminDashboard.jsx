import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ user_id: '', product: '', region: '', from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const token = localStorage.getItem('access_token');
  const rowsPerPage = 5;

  // Load users
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/auth/all-users/', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setUsers(res.data)).catch(console.error);
  }, []);

  // Load data
  useEffect(() => { fetchFilteredData(); }, []);

  const fetchFilteredData = () => {
    const params = new URLSearchParams(filters).toString();
    axios.get(`http://127.0.0.1:8000/api/sales/admin/all-sales/?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data);
      calculateTotals(res.data);
    }).catch(console.error);
  };

  const calculateTotals = (entries) => {
    let revenue = 0, quantity = 0;
    entries.forEach(e => {
      revenue += parseFloat(e.revenue || 0);
      quantity += parseInt(e.quantity || 0);
    });
    setTotalRevenue(revenue);
    setTotalQuantity(quantity);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const cleared = { user_id: '', product: '', region: '', from: '', to: '' };
    setFilters(cleared);
    setCurrentPage(1);
    setTimeout(fetchFilteredData, 0);
  };

  const handleExport = (type) => {
    const params = new URLSearchParams(filters).toString();
    const url = `http://127.0.0.1:8000/api/sales/export-${type}/?${params}`;
    window.open(url, '_blank');
  };

  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="container mt-5">
      <h4 className="mb-4">🛠️ Admin Dashboard – All Uploads</h4>

      {/* Filter Form */}
      <form onSubmit={e => { e.preventDefault(); fetchFilteredData(); }}>
        <div className="row mb-3 g-3">
          <div className="col-md-2">
            <select className="form-select" name="user_id" value={filters.user_id} onChange={handleFilterChange}>
              <option value="">All Users</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div className="col-md-2"><input type="text" name="product" value={filters.product} placeholder="Product" className="form-control" onChange={handleFilterChange} /></div>
          <div className="col-md-2"><input type="text" name="region" value={filters.region} placeholder="Region" className="form-control" onChange={handleFilterChange} /></div>
          <div className="col-md-2"><input type="date" name="from" value={filters.from} className="form-control" onChange={handleFilterChange} /></div>
          <div className="col-md-2"><input type="date" name="to" value={filters.to} className="form-control" onChange={handleFilterChange} /></div>
          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary w-100">Apply</button>
            <button type="button" className="btn btn-secondary w-100" onClick={handleReset}>Reset</button>
          </div>
        </div>
      </form>

      {/* Export & Totals */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button className="btn btn-outline-success me-2" onClick={() => handleExport('csv')}>Export CSV</button>
          <button className="btn btn-outline-danger" onClick={() => handleExport('pdf')}>Export PDF</button>
        </div>
        <div>
          <strong>📦 Total Quantity:</strong> {totalQuantity} &nbsp;
          <strong>💰 Total Revenue:</strong> ₹{totalRevenue.toFixed(2)}
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>#</th><th>User</th><th>Product</th><th>Category</th><th>Region</th><th>Qty</th><th>Revenue</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? paginatedData.map((e, i) => (
            <tr key={i}>
              <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
              <td>{e.user}</td><td>{e.product}</td><td>{e.category}</td><td>{e.region}</td>
              <td>{e.quantity}</td><td>₹{e.revenue}</td><td>{new Date(e.uploaded_at).toLocaleString()}</td>
            </tr>
          )) : <tr><td colSpan="8" className="text-center">No records found.</td></tr>}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-end align-items-center">
        <span className="me-2">Page {currentPage} of {totalPages}</span>
        <button className="btn btn-sm btn-outline-primary me-1" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
        <button className="btn btn-sm btn-outline-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>

      {/* Charts */}
      <div className="row mt-5">
        <div className="col-md-6">
          <h5>📊 Revenue by Product</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="product" /><YAxis /><Tooltip />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6">
          <h5>🌍 Sales by Region</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.reduce((acc, curr) => {
                  const region = curr.region || 'Unknown';
                  const existing = acc.find(r => r.region === region);
                  if (existing) existing.value += curr.revenue;
                  else acc.push({ region, value: curr.revenue });
                  return acc;
                }, [])}
                dataKey="value"
                nameKey="region"
                outerRadius={100}
                label
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
