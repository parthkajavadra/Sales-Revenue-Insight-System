// src/UploadHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UploadHistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios
      .get('http://127.0.0.1:8000/api/sales/upload-history/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setHistory(res.data))
      .catch(() => setError('❌ Failed to load upload history.'));
  }, []);

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">📁 Upload History</h4>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {history.length === 0 ? (
        <div className="text-center">No upload history found.</div>
      ) : (
        <table className="table table-bordered table-striped table-hover">
          <thead className="table-primary">
            <tr>
              <th className="text-center">#</th>
              <th>Filename</th>
              <th>Uploaded At</th>
              <th>Records</th> {/* ✅ New column */}
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={entry.id || index}>
                <td className="text-center">{index + 1}</td>
                <td>{entry.filename}</td>
                <td>
                  {new Date(entry.uploaded_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td>{entry.records_count}</td> {/* ✅ Display row count */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UploadHistoryPage;
