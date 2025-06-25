import React from 'react';

function Footer() {
  return (
    <footer className="text-white text-center py-3 mt-auto" style={{ backgroundColor: '#1f2937' }}>
      <div>© {new Date().getFullYear()} <strong>Sales Insight System</strong>. All rights reserved.</div>
      <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
        Designed with ❤️ using React + Django
      </div>
    </footer>
  );
}

export default Footer;
