import React, { useState, useEffect } from 'react';
import { openingBalanceAPI } from '../services/openingBalanceAPI';
import { ledgerAPI } from '../services/api';
import { toast } from 'react-toastify';

const OpeningBalance = () => {
  const [ledgers, setLedgers] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    const res = await ledgerAPI.getAll();
    setLedgers(res.data.data);
  };

  const handleChange = (ledgerId, field, value) => {
    setEntries(prev => {
      const copy = [...prev];
      const index = copy.findIndex(e => e.ledgerId === ledgerId);

      if (index === -1) {
        copy.push({ ledgerId, debit: 0, credit: 0, [field]: Number(value) });
      } else {
        copy[index][field] = Number(value);
      }
      return copy;
    });
  };

  const submit = async () => {
    try {
      await openingBalanceAPI.create(
        entries.filter(e => e.debit > 0 || e.credit > 0)
      );
      toast.success('Opening balance saved');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="container">
      <h1>Opening Balance</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Ledger</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {ledgers.map(l => (
            <tr key={l.id}>
              <td>{l.ledgerName}</td>
              <td>
                <input
                  type="number"
                  onChange={e => handleChange(l.id, 'debit', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  onChange={e => handleChange(l.id, 'credit', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary" onClick={submit}>
        Save Opening Balance
      </button>
    </div>
  );
};

export default OpeningBalance;
