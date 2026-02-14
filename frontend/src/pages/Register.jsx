import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI, companyAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [createdCompany, setCreatedCompany] = useState(null);

  // Step 1: Create Company
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await companyAPI.create(companyData);
      
      if (response.data.success) {
        setCreatedCompany(response.data.data);
        toast.success('Company created! Now create your admin account.');
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create company');
      console.error('Company creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Admin User & Auto-Login
  const handleUserSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (userData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering user...'); // Debug

      const response = await authAPI.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        companyId: createdCompany.id,
        role: 'ADMIN',
      });

      console.log('Registration response:', response.data); // Debug

      if (response.data.success) {
        const { token, user, company } = response.data.data;

        console.log('Token received:', token); // Debug
        console.log('User data:', user); // Debug

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('selectedCompany', JSON.stringify(company));

        // Show success message
        toast.success('Registration successful! Welcome to VyaparERP!');

        // Wait a moment then redirect
        setTimeout(() => {
          console.log('Redirecting to dashboard...'); // Debug
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          gap: '8px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 1 ? '#2563eb' : '#e5e7eb',
            color: step >= 1 ? 'white' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            1
          </div>
          <div style={{
            width: '60px',
            height: '2px',
            background: step >= 2 ? '#2563eb' : '#e5e7eb',
            alignSelf: 'center',
          }} />
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 2 ? '#2563eb' : '#e5e7eb',
            color: step >= 2 ? 'white' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            2
          </div>
        </div>

        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '8px', 
          color: '#1a1a1a',
          fontSize: '24px',
        }}>
          {step === 1 ? 'Register Your Company' : 'Create Admin Account'}
        </h1>

        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          {step === 1 
            ? 'Step 1: Enter your company details' 
            : 'Step 2: Create your admin login'}
        </p>

        {/* STEP 1: Company Form */}
        {step === 1 && (
          <form onSubmit={handleCompanySubmit}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="form-input"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                required
                placeholder="ABC Traders Pvt Ltd"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Email *</label>
              <input
                type="email"
                className="form-input"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                required
                placeholder="info@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-input"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                required
                placeholder="+91-9876543210"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyData.city}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyData.state}
                  onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={companyData.gstNumber}
                onChange={(e) => setCompanyData({ ...companyData, gstNumber: e.target.value })}
                placeholder="27AABCU9603R1ZV"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '16px' }}
            >
              {loading ? 'Creating Company...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* STEP 2: User Form */}
        {step === 2 && (
          <form onSubmit={handleUserSubmit}>
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #86efac',
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#15803d' }}>
                ✓ Company "{createdCompany?.name}" created successfully!
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                className="form-input"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Email *</label>
              <input
                type="email"
                className="form-input"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
                placeholder="john@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
                minLength={8}
                placeholder="••••••••"
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Minimum 8 characters
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {/* Login Link */}
        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#6b7280',
          fontSize: '14px',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;