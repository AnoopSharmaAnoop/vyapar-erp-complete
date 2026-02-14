import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CompanySelection = () => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstNumber: '',
    panNumber: ''
  });

  const { setSelectedCompany } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await companyAPI.create(formData);
      toast.success('Company created successfully!');
      setShowModal(false);
      fetchCompanies();
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        gstNumber: '',
        panNumber: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create company');
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    navigate('/dashboard');
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

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Select or Create Company</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create New Company
        </button>
      </div>

// Add this to the page
<div style={{ textAlign: 'center', marginTop: '20px' }}>
  <p style={{ color: '#6b7280', marginBottom: '10px' }}>
    First time here?
  </p>
  <Link to="/register" className="btn btn-primary">
    Register New Company
  </Link>
</div>


      <div className="grid grid-3">
        {companies.map((company) => (
          <div key={company.id} className="card" style={{ cursor: 'pointer' }}
               onClick={() => handleCompanySelect(company)}>
            <h3>{company.name}</h3>
            <p>{company.email}</p>
            <p>{company.phone}</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              {company.city}, {company.state}
            </p>
          </div>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No companies found</h3>
          <p>Create your first company to get started</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Company</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  className="form-input"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="address.city"
                    className="form-input"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="address.state"
                    className="form-input"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    className="form-input"
                    value={formData.address.pincode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    className="form-input"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    className="form-input"
                    value={formData.panNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelection;
