import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../services/api';

const ProfitLoss = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await reportAPI.getProfitLoss(startDate, endDate);
      setReportData(response.data.data);
      toast.success('P&L Account generated successfully');
    } catch (error) {
      toast.error('Failed to generate P&L Account');
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
        <h1 className="page-title">Profit & Loss Account</h1>
        {reportData && (
          <button className="btn btn-secondary hide-print" onClick={printReport}>
            🖨️ Print
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card hide-print">
        <h3>Select Period</h3>
        <div className="grid grid-3" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
            <h2>Profit & Loss Account</h2>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              For the period: {new Date(reportData.period.startDate).toLocaleDateString()} to{' '}
              {new Date(reportData.period.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-2">
            {/* EXPENSES (Left Side) */}
            <div>
              <h3 style={{ 
                backgroundColor: '#fee2e2', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px',
                color: '#991b1b'
              }}>
                EXPENSES
              </h3>

              {/* Direct Expenses */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Direct Expenses
                </h4>
                {reportData.expenses.directExpenses.items.map((item, index) => (
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
                  <span>Total Direct Expenses</span>
                  <span>₹{reportData.expenses.directExpenses.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Indirect Expenses */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Indirect Expenses
                </h4>
                {reportData.expenses.indirectExpenses.items.map((item, index) => (
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
                  <span>Total Indirect Expenses</span>
                  <span>₹{reportData.expenses.indirectExpenses.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Net Profit (if profit) */}
              {reportData.profitOrLoss === 'PROFIT' && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '6px',
                  marginTop: '20px',
                  fontSize: '18px'
                }}>
                  <span>NET PROFIT</span>
                  <span>₹{Math.abs(reportData.netProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                fontWeight: 'bold',
                backgroundColor: '#1f2937',
                color: 'white',
                borderRadius: '6px',
                marginTop: '12px',
                fontSize: '18px'
              }}>
                <span>TOTAL</span>
                <span>
                  ₹{(reportData.expenses.totalExpenses + (reportData.profitOrLoss === 'PROFIT' ? reportData.netProfitLoss : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* INCOME (Right Side) */}
            <div>
              <h3 style={{ 
                backgroundColor: '#d1fae5', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px',
                color: '#065f46'
              }}>
                INCOME
              </h3>

              {/* Direct Income */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Direct Income (Sales/Revenue)
                </h4>
                {reportData.income.directIncome.items.map((item, index) => (
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
                  <span>Total Direct Income</span>
                  <span>₹{reportData.income.directIncome.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Indirect Income */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  Indirect Income
                </h4>
                {reportData.income.indirectIncome.items.map((item, index) => (
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
                  <span>Total Indirect Income</span>
                  <span>₹{reportData.income.indirectIncome.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Net Loss (if loss) */}
              {reportData.profitOrLoss === 'LOSS' && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  fontWeight: 'bold',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '6px',
                  marginTop: '20px',
                  fontSize: '18px'
                }}>
                  <span>NET LOSS</span>
                  <span>₹{Math.abs(reportData.netProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                fontWeight: 'bold',
                backgroundColor: '#1f2937',
                color: 'white',
                borderRadius: '6px',
                marginTop: '12px',
                fontSize: '18px'
              }}>
                <span>TOTAL</span>
                <span>
                  ₹{(reportData.income.totalIncome + (reportData.profitOrLoss === 'LOSS' ? Math.abs(reportData.netProfitLoss) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: reportData.profitOrLoss === 'PROFIT' ? '#d1fae5' : '#fee2e2',
            borderRadius: '8px',
            border: `2px solid ${reportData.profitOrLoss === 'PROFIT' ? '#10b981' : '#ef4444'}`
          }}>
            <h3 style={{ marginBottom: '16px' }}>Summary</h3>
            <div className="grid grid-2">
              <div>
                <p><strong>Total Income:</strong> ₹{reportData.income.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p><strong>Total Expenses:</strong> ₹{reportData.expenses.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p><strong>Gross Profit:</strong> ₹{reportData.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: reportData.profitOrLoss === 'PROFIT' ? '#065f46' : '#991b1b'
                }}>
                  <strong>Net {reportData.profitOrLoss}:</strong> ₹{Math.abs(reportData.netProfitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
            <p>Select a date range and click "Generate Report" to view Profit & Loss Account</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;
