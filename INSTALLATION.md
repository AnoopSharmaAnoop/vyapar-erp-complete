# 🚀 COMPLETE INSTALLATION GUIDE

## VyaparERP - Full Setup Instructions

---

## ⚠️ IMPORTANT: What's Included

This package contains:
✅ Complete backend with PostgreSQL + Prisma
✅ Complete frontend with React
✅ All accounting features (Trial Balance, P&L, Balance Sheet)
✅ Tax calculations (GST, TDS, TCS)
✅ User management system
✅ Security (JWT authentication)
✅ Responsive design

---

## 📋 Prerequisites

Before you start, install these:

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Check: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download: https://www.postgresql.org/download/
   - Check: `psql --version`

3. **npm** (comes with Node.js)
   - Check: `npm --version`

---

## 🗄️ STEP 1: Setup PostgreSQL Database

### Option A: Local PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**On Windows:**
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow wizard
- Default port: 5432

### Option B: Docker (Easiest!)
```bash
docker run --name vyapar-postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=vyapar_erp \
  -p 5432:5432 \
  -d postgres:14
```

### Create Database

Connect to PostgreSQL:
```bash
# Linux/Mac
sudo -u postgres psql

# Windows (in psql terminal)
psql -U postgres
```

Create database:
```sql
CREATE DATABASE vyapar_erp;
\q
```

---

## 📦 STEP 2: Backend Setup

### 2.1 Navigate to Backend
```bash
cd vyapar-erp-complete/backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This will install:
- Express (web framework)
- Prisma (database ORM)
- @prisma/client (Prisma client)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (cross-origin support)
- And other dependencies

### 2.3 Configure Environment Variables

Edit the `.env` file:
```bash
# Open .env file
nano .env  # or use your text editor
```

Update with your PostgreSQL credentials:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vyapar_erp?schema=public"
JWT_SECRET=your_super_secret_key_change_this_in_production_min_32_chars
NODE_ENV=development
```

**Important:** Replace:
- `YOUR_PASSWORD` with your PostgreSQL password
- `JWT_SECRET` with a random 32+ character string

### 2.4 Setup Prisma

**Which schema to use?**
You have 3 schema options:

1. **schema.prisma** - Basic schema (items, ledgers, vouchers)
2. **schema-with-auth.prisma** - Adds user authentication
3. **schema-complete.prisma** - Full accounting (RECOMMENDED) ⭐

**Use the complete schema:**
```bash
# Rename the complete schema to be the active one
cp prisma/schema-complete.prisma prisma/schema.prisma
```

### 2.5 Generate Prisma Client
```bash
npx prisma generate
```

This creates the Prisma client with all your models.

### 2.6 Run Database Migrations
```bash
npx prisma migrate dev --name initial_setup
```

This will:
- Create all tables in PostgreSQL
- Setup foreign keys and constraints
- Create indexes
- Setup enums

You should see:
```
✔ Generated Prisma Client
✔ Applied migration: initial_setup
```

### 2.7 (Optional) View Database
```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

### 2.8 Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see:
```
Server is running on port 5000
Database: PostgreSQL
Environment: development
```

✅ **Backend is now running on http://localhost:5000**

---

## 🎨 STEP 3: Frontend Setup

Open a **NEW terminal** (keep backend running).

### 3.1 Navigate to Frontend
```bash
cd vyapar-erp-complete/frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install:
- React (UI library)
- React Router (navigation)
- Axios (HTTP client)
- React Toastify (notifications)
- Vite (build tool)

### 3.3 Start Frontend Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **Frontend is now running on http://localhost:3000**

---

## 🎯 STEP 4: First Time Setup

### 4.1 Open Application
Open your browser and go to: **http://localhost:3000**

### 4.2 Create Your First Company
1. Click "Create New Company"
2. Fill in:
   - Company Name: "My Business"
   - Email: "admin@mybusiness.com"
   - Phone: "1234567890"
   - GST Number (optional)
3. Click "Create Company"
4. Select the company

### 4.3 Register First User (If using authentication)
```bash
# Use API or create user directly
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mybusiness.com",
    "password": "admin123",
    "name": "Admin User",
    "companyId": 1
  }'
```

---

## ✅ STEP 5: Verify Installation

### Check Backend
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "VyaparERP API is running",
  "database": "PostgreSQL connected"
}
```

### Check Database Tables
```bash
npx prisma studio
```

You should see tables:
- companies
- users
- items
- ledgers
- vouchers
- journal_entries
- audit_logs
- etc.

---

## 🔧 Troubleshooting

### Problem 1: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # Mac

# Test connection
psql -U postgres -d vyapar_erp
```

### Problem 2: "Prisma Client not found"

**Solution:**
```bash
cd backend
npx prisma generate
```

### Problem 3: "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name initial_setup
```

### Problem 4: "Port 5000 already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux

# OR change port in .env
PORT=5001
```

### Problem 5: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem 6: DATABASE_URL not found

**Solution:**
Make sure `.env` file exists in backend folder:
```bash
cd backend
cat .env  # Should show your environment variables
```

---

## 📚 What to Do Next

### 1. Create Sample Data
- Add some items (Products/Services)
- Create ledgers (Customers/Suppliers)
- Create vouchers (Sales/Purchase invoices)

### 2. Explore Features
- **Dashboard**: Overview of business
- **Items**: Manage inventory
- **Ledgers**: Chart of accounts
- **Vouchers**: Transactions
- **Reports** (API): 
  - Trial Balance: `/api/reports/trial-balance`
  - P&L Account: `/api/reports/profit-loss`
  - Balance Sheet: `/api/reports/balance-sheet`

### 3. View Reports
Use tools like Postman or curl:
```bash
# Trial Balance
curl "http://localhost:5000/api/reports/trial-balance?startDate=2024-04-01&endDate=2024-03-31"

# Profit & Loss
curl "http://localhost:5000/api/reports/profit-loss?startDate=2024-04-01&endDate=2024-03-31"

# Balance Sheet
curl "http://localhost:5000/api/reports/balance-sheet?asOnDate=2024-03-31"
```

---

## 🎓 Understanding the Structure

### Backend Structure:
```
backend/
├── prisma/
│   ├── schema.prisma          ← Database schema
│   ├── schema-complete.prisma ← Full accounting schema ⭐
│   └── migrations/            ← Database migrations
├── controllers/               ← Business logic
│   ├── authController.js      ← User authentication
│   ├── companyController.js   ← Company management
│   ├── itemController.js      ← Inventory
│   ├── ledgerController.js    ← Ledgers
│   ├── voucherController.js   ← Transactions
│   └── reportsController.js   ← Financial reports
├── middleware/
│   └── auth.js               ← JWT authentication
├── utils/
│   └── taxCalculations.js    ← Tax formulas
├── routes/                   ← API routes
├── config/
│   └── prisma.js            ← Prisma client
├── server.js                ← Express server
├── package.json             ← Dependencies
└── .env                     ← Configuration
```

### Frontend Structure:
```
frontend/
├── src/
│   ├── pages/               ← React pages
│   │   ├── Dashboard.jsx
│   │   ├── Items.jsx
│   │   ├── Ledgers.jsx
│   │   └── Vouchers.jsx
│   ├── components/
│   │   └── Navbar.jsx
│   ├── services/
│   │   └── api.js          ← API calls
│   ├── context/
│   │   └── AppContext.jsx  ← Global state
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 🔐 Security Notes

1. **Change JWT Secret**: Use a strong, random 32+ character string
2. **Change Database Password**: Don't use default passwords
3. **HTTPS in Production**: Enable SSL/TLS
4. **Environment Variables**: Never commit `.env` file
5. **User Passwords**: Minimum 8 characters recommended

---

## 📖 Documentation

Read these guides:
- **README.md** - Overview and features
- **ACCOUNTING_FEATURES.md** - Trial Balance, P&L, Balance Sheet
- **SECURITY.md** - Authentication and authorization
- **RESPONSIVE.md** - Mobile optimization
- **QUICKSTART.md** - Quick setup guide

---

## 🚀 Production Deployment

### Backend (Node.js + PostgreSQL)

1. **Use managed PostgreSQL**:
   - AWS RDS
   - Google Cloud SQL
   - Heroku Postgres
   - DigitalOcean

2. **Deploy backend**:
   - Heroku
   - Railway
   - Render
   - DigitalOcean App Platform

3. **Run migrations**:
```bash
npx prisma migrate deploy
```

4. **Set environment variables** on hosting platform

### Frontend (React)

1. **Build frontend**:
```bash
cd frontend
npm run build
```

2. **Deploy** to:
   - Vercel (recommended)
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

---

## 🆘 Getting Help

### Check Logs

**Backend:**
```bash
# View logs
cd backend
npm run dev
```

**Database:**
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Prisma:**
```bash
# View all migrations
npx prisma migrate status

# View database schema
npx prisma db pull
```

### Common Commands

```bash
# Prisma
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create migration
npx prisma migrate deploy  # Apply migrations
npx prisma studio          # Visual database browser
npx prisma db push         # Push schema changes (dev only)
npx prisma db seed         # Run seed script

# Backend
npm install                # Install dependencies
npm run dev                # Development mode
npm start                  # Production mode

# Frontend
npm install                # Install dependencies
npm run dev                # Development mode
npm run build              # Production build
npm run preview            # Preview build
```

---

## ✅ Installation Complete!

You now have:
- ✅ PostgreSQL database running
- ✅ Prisma ORM configured
- ✅ Backend API running on port 5000
- ✅ Frontend app running on port 3000
- ✅ Complete accounting system
- ✅ User authentication
- ✅ Tax calculations
- ✅ Financial reports

**Start using your ERP system!** 🎉

---

## 📞 Support

For issues:
1. Check this installation guide
2. Read ACCOUNTING_FEATURES.md
3. Check Prisma docs: https://www.prisma.io/docs
4. Check PostgreSQL docs: https://www.postgresql.org/docs

---

**Built with ❤️ using React + Node.js + PostgreSQL + Prisma**
