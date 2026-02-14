import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../services/api';

const BalanceSheet = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [asOnDate, setAsOnDate] = useState('');

  const generateReport = async () => {
    if (!asOnDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      setLoading(true);
      const response = await reportAPI.getBalanceSheet(asOnDate);
      setReportData(response.data.data);
      toast.success('Balance Sheet generated successfully');
    } catch (error) {
      toast.error('Failed to generate Balance Sheet');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Balance Sheet</h1>
        {reportData && (
          <button className="btn btn-secondary hide-print" onClick={printReport}>
            🖨️ Print
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card hide-print">
        <h3>Select Date</h3>
        <div className="grid grid-3" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">As On Date *</label>
            <input
              type="date"
              className="form-input"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report */}
      {reportData && (
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2>Balance Sheet</h2>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              As on {new Date(reportData.asOnDate).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-2">
            {/* LIABILITIES (Left Side) */}
            <div>
              <h3 style={{ 
                backgroundColor: '#dbeafe', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px',
                color: '#1e40af'
              }}>
                LIABILITIES
              </h3>

              {/* Capital */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Capital Account
                </h4>
                {reportData.liabilities.capital.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {reportData.profitLoss && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6',
                    color: reportData.profitLoss.type === 'PROFIT' ? '#065f46' : '#991b1b',
                    fontWeight: '500'
                  }}>
                    <span>Add: Current Year {reportData.profitLoss.type}</span>
                    <span>
                      ₹{reportData.profitLoss.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Capital</span>
                  <span>₹{(reportData.liabilities.capital.total + (reportData.profitLoss?.type === 'PROFIT' ? reportData.profitLoss.amount : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Long Term Liabilities */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Long Term Liabilities
                </h4>
                {reportData.liabilities.longTermLiabilities.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Long Term Liabilities</span>
                  <span>₹{reportData.liabilities.longTermLiabilities.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Current Liabilities */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Current Liabilities
                </h4>
                {reportData.liabilities.currentLiabilities.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Current Liabilities</span>
                  <span>₹{reportData.liabilities.currentLiabilities.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Provisions */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Provisions
                </h4>
                {reportData.liabilities.provisions.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Provisions</span>
                  <span>₹{reportData.liabilities.provisions.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Total Liabilities */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                fontWeight: 'bold',
                backgroundColor: '#1f2937',
                color: 'white',
                borderRadius: '6px',
                marginTop: '20px',
                fontSize: '18px'
              }}>
                <span>TOTAL LIABILITIES</span>
                <span>₹{(reportData.liabilities.totalLiabilities + (reportData.profitLoss?.type === 'PROFIT' ? reportData.profitLoss.amount : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* ASSETS (Right Side) */}
            <div>
              <h3 style={{ 
                backgroundColor: '#d1fae5', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px',
                color: '#065f46'
              }}>
                ASSETS
              </h3>

              {/* Fixed Assets */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Fixed Assets
                </h4>
                {reportData.assets.fixedAssets.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Fixed Assets</span>
                  <span>₹{reportData.assets.fixedAssets.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Investments */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Investments
                </h4>
                {reportData.assets.investments.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Investments</span>
                  <span>₹{reportData.assets.investments.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Current Assets */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Current Assets
                </h4>
                {reportData.assets.currentAssets.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Current Assets</span>
                  <span>₹{reportData.assets.currentAssets.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Loans & Advances (Assets) */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Loans & Advances
                </h4>
                {reportData.assets.loansAssets.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span>{item.ledgerName}</span>
                    <span style={{ fontWeight: '500' }}>
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontWeight: 'bold',
                  backgroundColor: '#f9fafb',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  marginTop: '8px',
                  borderRadius: '4px'
                }}>
                  <span>Total Loans & Advances</span>
                  <span>₹{reportData.assets.loansAssets.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Total Assets */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                fontWeight: 'bold',
                backgroundColor: '#1f2937',
                color: 'white',
                borderRadius: '6px',
                marginTop: '20px',
                fontSize: '18px'
              }}>
                <span>TOTAL ASSETS</span>
                <span>₹{reportData.assets.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Balance Verification */}
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: Math.abs(reportData.difference) < 0.01 ? '#d1fae5' : '#fee2e2',
            borderRadius: '8px',
            border: `2px solid ${Math.abs(reportData.difference) < 0.01 ? '#10b981' : '#ef4444'}`
          }}>
            <h3 style={{ marginBottom: '16px' }}>Balance Verification</h3>
            <div className="grid grid-3">
              <div>
                <p><strong>Total Assets:</strong></p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ₹{reportData.assets.totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p><strong>Total Liabilities:</strong></p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ₹{(reportData.liabilities.totalLiabilities + (reportData.profitLoss?.type === 'PROFIT' ? reportData.profitLoss.amount : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p><strong>Difference:</strong></p>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: Math.abs(reportData.difference) < 0.01 ? '#065f46' : '#991b1b'
                }}>
                  {Math.abs(reportData.difference) < 0.01 ? '✓ Balanced' : `₹${Math.abs(reportData.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="card">
          <div className="empty-state">
            <h3>No Report Generated</h3>
            <p>Select a date and click "Generate Report" to view Balance Sheet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;
