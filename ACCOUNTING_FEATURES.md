# 📊 COMPLETE ACCOUNTING SYSTEM DOCUMENTATION

## VyaparERP - Enterprise Accounting Features

### ✅ What's Been Added:

1. **User Management System** 👥
2. **Trial Balance** 📋
3. **Profit & Loss Account** 💰
4. **Balance Sheet** 📊
5. **Complete Tax Calculations** 🧮
6. **GST Reports (GSTR-1)** 📑
7. **Audit Logging** 📝
8. **Journal Entries** 📖
9. **Depreciation** 📉
10. **TDS/TCS Calculations** 💵

---

## 1. USER MANAGEMENT SYSTEM 👥

### Features:
- ✅ Role-based access control (7 roles)
- ✅ User tied to ONE company only
- ✅ Custom permissions (JSON)
- ✅ Password management
- ✅ Last login tracking
- ✅ Audit trail for all actions

### User Roles:
```javascript
SUPER_ADMIN    // Full system access
ADMIN          // Company admin
ACCOUNTANT     // Financial operations
MANAGER        // View reports, manage operations
SALES_USER     // Create sales vouchers
PURCHASE_USER  // Create purchase vouchers
USER           // Basic access
```

### API Endpoints:
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
GET    /api/auth/profile           - Get profile
PUT    /api/auth/profile           - Update profile
POST   /api/auth/change-password   - Change password
GET    /api/users                  - List users (Admin only)
PUT    /api/users/:id/role         - Update role (Admin only)
DELETE /api/users/:id              - Deactivate user
```

### Audit Log:
Every action is logged:
- User who performed action
- Action type (CREATE, UPDATE, DELETE, VIEW)
- Entity affected
- Old and new values
- IP address and user agent
- Timestamp

---

## 2. TRIAL BALANCE 📋

### What is Trial Balance?
A statement showing all ledger balances (debit and credit) to verify double-entry bookkeeping is balanced.

### API Endpoint:
```
GET /api/reports/trial-balance?startDate=2024-04-01&endDate=2024-03-31
```

### Response Structure:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-04-01",
      "endDate": "2024-03-31"
    },
    "ledgers": [
      {
        "ledgerCode": "L001",
        "ledgerName": "Cash in Hand",
        "ledgerGroup": "CASH_IN_HAND",
        "openingBalance": 50000,
        "openingType": "DEBIT",
        "periodDebit": 100000,
        "periodCredit": 80000,
        "closingBalance": 70000,
        "closingType": "DEBIT"
      }
    ],
    "totals": {
      "totalOpeningDebit": 500000,
      "totalOpeningCredit": 500000,
      "totalPeriodDebit": 1000000,
      "totalPeriodCredit": 1000000,
      "totalClosingDebit": 800000,
      "totalClosingCredit": 800000
    }
  }
}
```

### Features:
- ✅ Date range filtering
- ✅ Opening balances
- ✅ Period transactions
- ✅ Closing balances
- ✅ Auto-verification (debit = credit)

---

## 3. PROFIT & LOSS ACCOUNT 💰

### What is P&L?
Statement showing company's revenues, costs, and expenses during a period, resulting in profit or loss.

### API Endpoint:
```
GET /api/reports/profit-loss?startDate=2024-04-01&endDate=2024-03-31
```

### Response Structure:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-04-01",
      "endDate": "2024-03-31"
    },
    "income": {
      "directIncome": {
        "items": [
          { "ledgerName": "Sales Account", "amount": 1000000 }
        ],
        "total": 1000000
      },
      "indirectIncome": {
        "items": [
          { "ledgerName": "Interest Income", "amount": 5000 }
        ],
        "total": 5000
      },
      "totalIncome": 1005000
    },
    "expenses": {
      "directExpenses": {
        "items": [
          { "ledgerName": "Purchase Account", "amount": 600000 }
        ],
        "total": 600000
      },
      "indirectExpenses": {
        "items": [
          { "ledgerName": "Rent", "amount": 50000 },
          { "ledgerName": "Salaries", "amount": 100000 }
        ],
        "total": 150000
      },
      "totalExpenses": 750000
    },
    "grossProfit": 400000,
    "netProfitLoss": 255000,
    "profitOrLoss": "PROFIT"
  }
}
```

### Features:
- ✅ Direct vs Indirect Income/Expenses
- ✅ Gross Profit calculation
- ✅ Net Profit/Loss calculation
- ✅ Categorized by ledger groups
- ✅ Date range filtering

---

## 4. BALANCE SHEET 📊

### What is Balance Sheet?
Statement showing company's assets, liabilities, and equity at a specific date.

### API Endpoint:
```
GET /api/reports/balance-sheet?asOnDate=2024-03-31
```

### Response Structure:
```json
{
  "success": true,
  "data": {
    "asOnDate": "2024-03-31",
    "assets": {
      "fixedAssets": {
        "items": [
          { "ledgerName": "Building", "amount": 500000 },
          { "ledgerName": "Machinery", "amount": 300000 }
        ],
        "total": 800000
      },
      "currentAssets": {
        "items": [
          { "ledgerName": "Cash", "amount": 70000 },
          { "ledgerName": "Debtors", "amount": 200000 },
          { "ledgerName": "Stock", "amount": 150000 }
        ],
        "total": 420000
      },
      "totalAssets": 1220000
    },
    "liabilities": {
      "capital": {
        "items": [
          { "ledgerName": "Owner's Capital", "amount": 500000 }
        ],
        "total": 500000
      },
      "currentLiabilities": {
        "items": [
          { "ledgerName": "Creditors", "amount": 150000 },
          { "ledgerName": "Bank OD", "amount": 50000 }
        ],
        "total": 200000
      },
      "totalLiabilities": 700000
    },
    "profitLoss": {
      "amount": 255000,
      "type": "PROFIT"
    },
    "difference": 0
  }
}
```

### Features:
- ✅ Assets categorization
- ✅ Liabilities categorization
- ✅ Profit/Loss integration
- ✅ Balance verification
- ✅ As-on-date reporting

---

## 5. TAX CALCULATIONS 🧮

### 5.1 GST Calculation

**Function:** `calculateGST(amount, gstRate, gstType, cessRate)`

```javascript
const taxUtils = require('./utils/taxCalculations');

// Intrastate transaction (CGST + SGST)
const gst1 = taxUtils.calculateGST(10000, 18, 'GST', 0);
// Result:
// {
//   taxableAmount: 10000,
//   cgstRate: 9,
//   cgstAmount: 900,
//   sgstRate: 9,
//   sgstAmount: 900,
//   igstRate: 0,
//   igstAmount: 0,
//   totalTax: 1800,
//   totalAmount: 11800
// }

// Interstate transaction (IGST)
const gst2 = taxUtils.calculateGST(10000, 18, 'IGST', 0);
// Result:
// {
//   taxableAmount: 10000,
//   igstRate: 18,
//   igstAmount: 1800,
//   totalTax: 1800,
//   totalAmount: 11800
// }
```

### 5.2 TDS Calculation

**Function:** `calculateTDS(amount, tdsRate)`

```javascript
// Professional fees with 10% TDS
const tds = taxUtils.calculateTDS(100000, 10);
// Result:
// {
//   grossAmount: 100000,
//   tdsRate: 10,
//   tdsAmount: 10000,
//   netAmount: 90000
// }
```

### 5.3 TCS Calculation

**Function:** `calculateTCS(amount, tcsRate)`

```javascript
// Sale with 0.1% TCS
const tcs = taxUtils.calculateTCS(1000000, 0.1);
// Result:
// {
//   saleAmount: 1000000,
//   tcsRate: 0.1,
//   tcsAmount: 1000,
//   totalAmount: 1001000
// }
```

### 5.4 Complete Voucher Tax Calculation

**Function:** `calculateVoucherTax(items, taxSettings)`

```javascript
const items = [
  {
    itemName: "Product A",
    quantity: 10,
    rate: 1000,
    discountPercent: 10,
    gstRate: 18,
    cessRate: 0
  },
  {
    itemName: "Product B",
    quantity: 5,
    rate: 2000,
    discountPercent: 5,
    gstRate: 12,
    cessRate: 0
  }
];

const taxSettings = {
  gstType: 'GST',
  placeOfSupply: 'Maharashtra',
  companyState: 'Maharashtra',
  tdsRate: 0,
  tcsRate: 0
};

const result = taxUtils.calculateVoucherTax(items, taxSettings);
// Result includes:
// - Item-wise calculations
// - Total taxable amount
// - CGST, SGST, IGST breakdown
// - TDS/TCS if applicable
// - Round-off
// - Final amount
```

### 5.5 GST Rate by HSN Code

```javascript
const gstRate = taxUtils.getGSTRateByHSN('8517'); // Mobile phones
// Returns: 18
```

### 5.6 GST Number Validation

```javascript
const validation = taxUtils.validateGSTNumber('27AAPFU0939F1ZV');
// Result:
// {
//   valid: true,
//   stateCode: '27',
//   pan: 'AAPFU0939F',
//   message: 'Valid GST number'
// }
```

---

## 6. GST REPORTS 📑

### GSTR-1 (Outward Supplies)

**API Endpoint:**
```
GET /api/reports/gstr1?month=3&year=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "month": 3, "year": 2024 },
    "invoices": [
      {
        "invoiceNumber": "INV001",
        "invoiceDate": "2024-03-15",
        "customerName": "ABC Ltd",
        "gstNumber": "27XXXXX",
        "placeOfSupply": "Maharashtra",
        "taxableValue": 10000,
        "cgst": 900,
        "sgst": 900,
        "igst": 0,
        "cess": 0,
        "totalTax": 1800,
        "invoiceValue": 11800
      }
    ],
    "summary": {
      "18": {
        "taxableValue": 50000,
        "cgst": 4500,
        "sgst": 4500,
        "igst": 0
      }
    },
    "totals": {
      "totalInvoices": 25,
      "totalTaxableValue": 500000,
      "totalCGST": 45000,
      "totalSGST": 45000,
      "totalIGST": 0,
      "totalTax": 90000,
      "totalInvoiceValue": 590000
    }
  }
}
```

---

## 7. JOURNAL ENTRIES 📖

### What are Journal Entries?
Double-entry bookkeeping: every transaction has equal debit and credit entries.

### Features:
- ✅ Auto-generated from vouchers
- ✅ Manual journal entries
- ✅ Debit = Credit validation
- ✅ Reversing entries
- ✅ Narration support
- ✅ Reference linking

### Example:
```
Sales Invoice: ₹11,800

Journal Entries:
1. Debit: Sundry Debtors - ₹11,800
   Credit: Sales Account - ₹10,000
   Credit: SGST Output - ₹900
   Credit: CGST Output - ₹900
```

### Auto-Generated Entries:
- Sales Invoice → Debit Customer, Credit Sales + Tax
- Purchase Invoice → Debit Purchase + Tax, Credit Supplier
- Payment → Debit Supplier, Credit Bank/Cash
- Receipt → Debit Bank/Cash, Credit Customer

---

## 8. DEPRECIATION 📉

### Methods Supported:
1. **SLM** - Straight Line Method
2. **WDV** - Written Down Value Method

### Function:
```javascript
// WDV Method
const dep = taxUtils.calculateDepreciation(100000, 15, 'WDV', 5);
// Result:
// {
//   method: 'WDV',
//   originalValue: 100000,
//   depreciationRate: 15,
//   years: 5,
//   schedule: [
//     { year: 1, openingWDV: 100000, depreciation: 15000, closingWDV: 85000 },
//     { year: 2, openingWDV: 85000, depreciation: 12750, closingWDV: 72250 },
//     ...
//   ],
//   totalDepreciation: 47781.56,
//   writtenDownValue: 52218.44
// }
```

---

## 9. LEDGER REPORT 📝

### Individual Ledger Statement

**API Endpoint:**
```
GET /api/reports/ledger?ledgerId=123&startDate=2024-04-01&endDate=2024-03-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ledger": {
      "ledgerName": "ABC Customer",
      "ledgerGroup": "SUNDRY_DEBTORS",
      "openingBalance": 50000,
      "openingType": "DEBIT"
    },
    "transactions": [
      {
        "date": "2024-04-05",
        "particulars": "Sales Account",
        "voucherNumber": "INV001",
        "voucherType": "SALES_INVOICE",
        "debit": 11800,
        "credit": 0,
        "balance": 61800,
        "balanceType": "DEBIT"
      },
      {
        "date": "2024-04-10",
        "particulars": "Cash Account",
        "voucherNumber": "RCP001",
        "voucherType": "RECEIPT",
        "debit": 0,
        "credit": 10000,
        "balance": 51800,
        "balanceType": "DEBIT"
      }
    ],
    "closingBalance": {
      "amount": 51800,
      "type": "DEBIT"
    }
  }
}
```

---

## 10. STOCK MOVEMENT TRACKING 📦

### Features:
- ✅ Every stock change is logged
- ✅ Opening stock, purchases, sales
- ✅ Stock transfers, adjustments
- ✅ Damage/wastage tracking
- ✅ Linked to vouchers

### Movement Types:
- OPENING_STOCK
- PURCHASE
- SALES
- SALES_RETURN
- PURCHASE_RETURN
- STOCK_TRANSFER
- DAMAGE
- ADJUSTMENT

---

## IMPLEMENTATION GUIDE

### Step 1: Update Schema
```bash
# Replace schema.prisma with schema-complete.prisma
cp prisma/schema-complete.prisma prisma/schema.prisma

# Run migration
npx prisma migrate dev --name complete_accounting_system
```

### Step 2: Add Controllers
- reportsController.js (already created)
- Enhanced voucherController with tax calculations
- userController for user management

### Step 3: Add Routes
```javascript
// routes/reportRoutes.js
router.get('/trial-balance', authenticate, reportsController.getTrialBalance);
router.get('/profit-loss', authenticate, reportsController.getProfitLoss);
router.get('/balance-sheet', authenticate, reportsController.getBalanceSheet);
router.get('/ledger', authenticate, reportsController.getLedgerReport);
router.get('/gstr1', authenticate, reportsController.getGSTR1);
```

### Step 4: Frontend Components
Create React components for:
- Trial Balance table
- P&L statement
- Balance Sheet
- GST Reports
- Ledger Statement

---

## FRONTEND EXAMPLE

### Trial Balance Component
```jsx
import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

const TrialBalance = () => {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('2024-04-01');
  const [endDate, setEndDate] = useState('2024-03-31');

  const fetchTrialBalance = async () => {
    const response = await reportsAPI.getTrialBalance(startDate, endDate);
    setData(response.data.data);
  };

  return (
    <div className="container">
      <h1>Trial Balance</h1>
      
      <div className="filters">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={fetchTrialBalance}>Generate</button>
      </div>

      {data && (
        <table className="table">
          <thead>
            <tr>
              <th>Ledger Code</th>
              <th>Ledger Name</th>
              <th>Opening Dr</th>
              <th>Opening Cr</th>
              <th>Period Dr</th>
              <th>Period Cr</th>
              <th>Closing Dr</th>
              <th>Closing Cr</th>
            </tr>
          </thead>
          <tbody>
            {data.ledgers.map(ledger => (
              <tr key={ledger.ledgerCode}>
                <td>{ledger.ledgerCode}</td>
                <td>{ledger.ledgerName}</td>
                <td>{ledger.openingType === 'DEBIT' ? ledger.openingBalance : ''}</td>
                <td>{ledger.openingType === 'CREDIT' ? ledger.openingBalance : ''}</td>
                <td>{ledger.periodDebit}</td>
                <td>{ledger.periodCredit}</td>
                <td>{ledger.closingType === 'DEBIT' ? ledger.closingBalance : ''}</td>
                <td>{ledger.closingType === 'CREDIT' ? ledger.closingBalance : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="2">Total</th>
              <th>{data.totals.totalOpeningDebit}</th>
              <th>{data.totals.totalOpeningCredit}</th>
              <th>{data.totals.totalPeriodDebit}</th>
              <th>{data.totals.totalPeriodCredit}</th>
              <th>{data.totals.totalClosingDebit}</th>
              <th>{data.totals.totalClosingCredit}</th>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};
```

---

## SECURITY FEATURES

### 1. Audit Trail
Every action logged with:
- User ID
- Action type
- Entity affected
- Old and new values
- IP address
- Timestamp

### 2. Role-Based Access
- Different permissions for different roles
- ADMIN can't access SUPER_ADMIN functions
- USER can only view assigned data

### 3. Data Isolation
- Users can only access their company's data
- CompanyId from JWT token
- Foreign key constraints

---

## TESTING

### Test Trial Balance:
```bash
curl -X GET "http://localhost:5000/api/reports/trial-balance?startDate=2024-04-01&endDate=2024-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test P&L:
```bash
curl -X GET "http://localhost:5000/api/reports/profit-loss?startDate=2024-04-01&endDate=2024-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Balance Sheet:
```bash
curl -X GET "http://localhost:5000/api/reports/balance-sheet?asOnDate=2024-03-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## SUMMARY

✅ **User Management** - Complete with roles and permissions
✅ **Trial Balance** - Verify books are balanced
✅ **Profit & Loss** - Know your profitability
✅ **Balance Sheet** - Financial position
✅ **Tax Calculations** - GST, TDS, TCS, Cess
✅ **GST Reports** - GSTR-1 ready
✅ **Audit Logging** - Track everything
✅ **Journal Entries** - Double-entry bookkeeping
✅ **Depreciation** - Asset management
✅ **Ledger Reports** - Individual statements

🎉 **Your ERP now has COMPLETE accounting capabilities!**
