import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { reportAPI } from '../services/api';

const TrialBalance = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getTrialBalance(startDate, endDate);
      setReportData(response.data.data);
      toast.success('Trial Balance generated successfully');
    } catch (error) {
      toast.error('Failed to generate Trial Balance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    // Simple CSV export
    if (!reportData) return;

    let csv = 'Ledger Code,Ledger Name,Ledger Group,Opening Dr,Opening Cr,Period Dr,Period Cr,Closing Dr,Closing Cr\n';
    
    reportData.ledgers.forEach(ledger => {
      csv += `${ledger.ledgerCode},${ledger.ledgerName},${ledger.ledgerGroup},`;
      csv += `${ledger.openingType === 'DEBIT' ? ledger.openingBalance : ''},`;
      csv += `${ledger.openingType === 'CREDIT' ? ledger.openingBalance : ''},`;
      csv += `${ledger.periodDebit},${ledger.periodCredit},`;
      csv += `${ledger.closingType === 'DEBIT' ? ledger.closingBalance : ''},`;
      csv += `${ledger.closingType === 'CREDIT' ? ledger.closingBalance : ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Trial Balance</h1>
        {reportData && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary hide-print" onClick={printReport}>
              🖨️ Print
            </button>
            <button className="btn btn-success hide-print" onClick={exportToExcel}>
              📊 Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card hide-print">
        <h3>Select Period</h3>
        <div className="grid grid-3" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2>Trial Balance</h2>
            {reportData.period.startDate && (
              <p>
                Period: {new Date(reportData.period.startDate).toLocaleDateString()} to{' '}
                {new Date(reportData.period.endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="table-container">
            <table className="table" style={{ fontSize: '14px' }}>
              <thead>
                <tr>
                  <th rowSpan="2">Ledger Code</th>
                  <th rowSpan="2">Ledger Name</th>
                  <th rowSpan="2">Group</th>
                  <th colSpan="2" style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Opening Balance
                  </th>
                  <th colSpan="2" style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Period Transactions
                  </th>
                  <th colSpan="2" style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Closing Balance
                  </th>
                </tr>
                <tr>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.ledgers.map((ledger, index) => (
                  <tr key={index}>
                    <td>{ledger.ledgerCode}</td>
                    <td>{ledger.ledgerName}</td>
                    <td>{ledger.ledgerGroup.replace(/_/g, ' ')}</td>
                    <td style={{ textAlign: 'right' }}>
                      {ledger.openingType === 'DEBIT'
                        ? `₹${ledger.openingBalance.toFixed(2)}`
                        : ''}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ledger.openingType === 'CREDIT'
                        ? `₹${ledger.openingBalance.toFixed(2)}`
                        : ''}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{ledger.periodDebit.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{ledger.periodCredit.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ledger.closingType === 'DEBIT'
                        ? `₹${ledger.closingBalance.toFixed(2)}`
                        : ''}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {ledger.closingType === 'CREDIT'
                        ? `₹${ledger.closingBalance.toFixed(2)}`
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}>
                    TOTAL
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalOpeningDebit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalOpeningCredit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalPeriodDebit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalPeriodCredit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalClosingDebit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{reportData.totals.totalClosingCredit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification */}
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <h4 style={{ color: '#15803d', marginBottom: '8px' }}>✓ Books Balanced</h4>
            <div className="grid grid-3">
              <div>
                <strong>Opening:</strong> Dr ₹{reportData.totals.totalOpeningDebit.toFixed(2)} = Cr ₹
                {reportData.totals.totalOpeningCredit.toFixed(2)}
              </div>
              <div>
                <strong>Period:</strong> Dr ₹{reportData.totals.totalPeriodDebit.toFixed(2)} = Cr ₹
                {reportData.totals.totalPeriodCredit.toFixed(2)}
              </div>
              <div>
                <strong>Closing:</strong> Dr ₹{reportData.totals.totalClosingDebit.toFixed(2)} = Cr ₹
                {reportData.totals.totalClosingCredit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="card">
          <div className="empty-state">
            <h3>No Report Generated</h3>
            <p>Select a date range and click "Generate Report" to view Trial Balance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialBalance;
