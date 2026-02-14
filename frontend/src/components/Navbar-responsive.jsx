import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar-responsive.css';

const Navbar = () => {
  const { selectedCompany, clearCompany } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearCompany();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <h2>VyaparERP</h2>
          </Link>

          {selectedCompany && (
            <>
              {/* Mobile Menu Toggle */}
              <button 
                className="menu-toggle" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>

              {/* Mobile Menu Wrapper */}
              <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                {/* Navigation Links */}
                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                  <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                  <Link to="/items" className="nav-link" onClick={closeMobileMenu}>
                    Items
                  </Link>
                  <Link to="/ledgers" className="nav-link" onClick={closeMobileMenu}>
                    Ledgers
                  </Link>
                  <Link to="/vouchers" className="nav-link" onClick={closeMobileMenu}>
                    Vouchers
                  </Link>
                </div>

                {/* Right Side */}
                <div className={`navbar-right ${mobileMenuOpen ? 'active' : ''}`}>
                  <div className="company-info">
                    <span className="company-name">{selectedCompany.name}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Switch Company
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {selectedCompany && (
        <div 
          className={`navbar-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default Navbar;
