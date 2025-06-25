import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminUploadHistory() {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/sales/admin/upload-history/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setHistory(res.data))
    .catch(err => console.error('Failed to load history', err));
  }, []);

  return (
    <div className="container mt-5">
      <h4>📂 Admin – Upload History</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Filename</th>
            <th>Uploaded At</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry.user}</td>
              <td>{entry.filename}</td>
              <td>{new Date(entry.uploaded_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUploadHistory;
