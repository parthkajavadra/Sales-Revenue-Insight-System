import React, { useState } from 'react';
import axios from 'axios';
import './UploadPage.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/sales/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      // ✅ Enhanced error logging
      console.error('Upload error:', err.response || err.message || err);

      if (err.response?.data?.error) {
        setMessage(`❌ ${err.response.data.error}`);
      } else if (err.response?.status === 400) {
        setMessage(`❌ Bad Request: Please check your CSV format or field names.`);
      } else {
        setMessage(`❌ ${err.message || 'Something went wrong.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow p-4" style={{ maxWidth: '480px', width: '100%' }}>
        <h4 className="mb-3 text-center">📤 Upload Sales CSV File</h4>

        <div className="mb-3">
          <input
            type="file"
            accept=".csv"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          className="btn btn-success w-100"
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>

        {message && (
          <div className="alert alert-info mt-4 text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
