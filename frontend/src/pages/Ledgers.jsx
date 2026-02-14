import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ledgerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Ledgers = () => {
  const { selectedCompany } = useApp();
  const [ledgers, setLedgers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    ledgerName: '',
    ledgerGroup: 'Sundry Debtors',
    openingBalance: 0,
 
    contactDetails: {
      phone: '',
      email: '',
      address: '',
      gstNumber: ''
    },
    creditLimit: 0,
    creditDays: 0
  });

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
      fetchLedgerGroups();
    }
  }, [selectedCompany]);


  const fetchLedgers = async () => {
    try {
      const response = await ledgerAPI.getByCompany(selectedCompany._id);
      setLedgers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch ledgers');
    }
  };


 

const getBalanceType = (ledgerType, balance) => {
  console.log(ledgers);

  if (balance === 0) return '-';

  if (['ASSET', 'EXPENSE'].includes(ledgerType)) {
    return balance >= 0 ? 'Debit' : 'Credit';
  }

  if (['LIABILITY', 'INCOME', 'EQUITY'].includes(ledgerType)) {
    return balance >= 0 ? 'Credit' : 'Debit';
  }

  return '-';
};





  const fetchLedgerGroups = async () => {
    try {
      const response = await ledgerAPI.getGroups();
      setLedgerGroups(response.data.data);
    } catch (error) {
      console.error('Failed to fetch ledger groups');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const data = {
  ledgerName: formData.ledgerName,
  ledgerGroup: formData.ledgerGroup,
  openingBalance: formData.openingBalance,
 
  creditLimit: formData.creditLimit,
  creditDays: formData.creditDays,
  phone: formData.contactDetails.phone,
  email: formData.contactDetails.email,
  address: formData.contactDetails.address,
  gstNumber: formData.contactDetails.gstNumber,
};

    
      if (editingLedger) {
        await ledgerAPI.update(editingLedger.id, data);
        toast.success('Ledger updated successfully!');
      } else {
        await ledgerAPI.create(data);
        toast.success('Ledger created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchLedgers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

 const handleEdit = (ledger) => {
  setEditingLedger(ledger);

  setFormData({
    ledgerName: ledger.ledgerName,
    ledgerGroup: ledger.ledgerGroup,
    openingBalance: ledger.openingBalance,
    balanceType: ledger.balanceType,
    creditLimit: ledger.creditLimit || 0,
    creditDays: ledger.creditDays || 0,
    contactDetails: {
      phone: ledger.phone || '',
      email: ledger.email || '',
      address: ledger.address || '',
      gstNumber: ledger.gstNumber || '',
    },
  });

  setShowModal(true);
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ledger?')) {
      try {
        await ledgerAPI.delete(id);
        toast.success('Ledger deleted successfully!');
        fetchLedgers();
      } catch (error) {
        toast.error('Failed to delete ledger');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      ledgerName: '',
      ledgerGroup: 'Sundry Debtors',
      openingBalance: 0,
      balanceType: 'Debit',
      contactDetails: {
        phone: '',
        email: '',
        address: '',
        gstNumber: ''
      },
      creditLimit: 0,
      creditDays: 0
    });
    setEditingLedger(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Ledgers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Ledger
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Ledger Name</th>
              <th>Group</th>
              <th>Current Balance</th>
              <th>Balance Type</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((ledger) => (
              <tr key={ledger.id}>
                <td>{ledger.ledgerName}</td>
                <td>{ledger.ledgerGroup}</td>
                <td>₹{Math.abs(ledger.balance || 0).toFixed(2)}</td>


                
<td>
  {getBalanceType(ledger.ledgerType, ledger.balance) === '-' 
    ? '-' 
    : (
      <span className={
        getBalanceType(ledger.ledgerType, ledger.balance) === 'Debit'
          ? 'badge badge-success'
          : 'badge badge-warning'
      }>
        {getBalanceType(ledger.ledgerType, ledger.balance)}
      </span>
    )
  }
</td>



                
                <td>{ledger.phone || '-'}</td>
                <td>
                  <button className="btn btn-primary" style={{ marginRight: '8px' }} onClick={() => handleEdit(ledger)}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(ledger.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledgers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No ledgers found. Create your first ledger!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingLedger ? 'Edit Ledger' : 'Add New Ledger'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ledger Name *</label>
                <input
                  type="text"
                  name="ledgerName"
                  className="form-input"
                  value={formData.ledgerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ledger Group *</label>
                <select name="ledgerGroup" className="form-select" value={formData.ledgerGroup} onChange={handleChange}>
                  {ledgerGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Opening Balance</label>
                  <input
                    type="number"
                    name="openingBalance"
                    className="form-input"
                    value={formData.openingBalance}
                    onChange={handleChange}
                  />
                </div>

            { /*   <div className="form-group">
                  <label className="form-label">Balance Type</label>
                  <select name="balanceType" className="form-select" value={formData.balanceType} onChange={handleChange}>
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>*/}
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Contact Details</h3>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="contactDetails.phone"
                    className="form-input"
                    value={formData.contactDetails.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="contactDetails.email"
                    className="form-input"
                    value={formData.contactDetails.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="contactDetails.address"
                  className="form-textarea"
                  value={formData.contactDetails.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  name="contactDetails.gstNumber"
                  className="form-input"
                  value={formData.contactDetails.gstNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Credit Limit</label>
                  <input
                    type="number"
                    name="creditLimit"
                    className="form-input"
                    value={formData.creditLimit}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Days</label>
                  <input
                    type="number"
                    name="creditDays"
                    className="form-input"
                    value={formData.creditDays}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLedger ? 'Update' : 'Create'} Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledgers;
