import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { itemAPI, ledgerAPI, voucherAPI } from '../services/api';
import { FaBoxes, FaBook, FaFileInvoice, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedCompany, setSelectedCompany } = useApp();

  const [stats, setStats] = useState({
    totalItems: 0,
    totalLedgers: 0,
    totalVouchers: 0,
    lowStockItems: 0,
  });

  // 🔐 AUTH + COMPANY HYDRATION
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedCompany = localStorage.getItem('selectedCompany');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedCompany && storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  }, [navigate, selectedCompany, setSelectedCompany]);

  // 📊 FETCH STATS (ONLY WHEN COMPANY READY)
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchStats();
    }
  }, [selectedCompany]);

  const fetchStats = async () => {
    try {
      const [itemsRes, ledgersRes, vouchersRes, lowStockRes] =
        await Promise.all([
          itemAPI.getByCompany(selectedCompany.id),
          ledgerAPI.getByCompany(selectedCompany.id),
          voucherAPI.getByCompany(selectedCompany.id, {}),
          itemAPI.getLowStock(selectedCompany.id),
        ]);

      setStats({
        totalItems: itemsRes.data.count || 0,
        totalLedgers: ledgersRes.data.count || 0,
        totalVouchers: vouchersRes.data.count || 0,
        lowStockItems: lowStockRes.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Welcome to {selectedCompany?.name}
      </p>

      <div className="grid grid-4">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <FaBoxes size={32} style={{ marginBottom: '12px' }} />
          <div className="stat-value">{stats.totalItems}</div>
          <div className="stat-label">Total Items</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <FaBook size={32} style={{ marginBottom: '12px' }} />
          <div className="stat-value">{stats.totalLedgers}</div>
          <div className="stat-label">Total Ledgers</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <FaFileInvoice size={32} style={{ marginBottom: '12px' }} />
          <div className="stat-value">{stats.totalVouchers}</div>
          <div className="stat-label">Total Vouchers</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <FaChartLine size={32} style={{ marginBottom: '12px' }} />
          <div className="stat-value">{stats.lowStockItems}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
