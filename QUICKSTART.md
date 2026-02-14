# VyaparERP PostgreSQL - Quick Start Guide

## 🚀 Get Started in 10 Minutes

### Step 1: Install PostgreSQL (5 minutes)

#### Option A: Local Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/ and install.

#### Option B: Docker (Easiest!)
```bash
docker run --name vyapar-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vyapar_erp \
  -p 5432:5432 \
  -d postgres:14
```

✅ PostgreSQL is now running!

### Step 2: Create Database (1 minute)

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE vyapar_erp;
\q
```

### Step 3: Setup Backend (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Configure .env file (edit with your password)
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/vyapar_erp?schema=public"' > .env
echo 'PORT=5000' >> .env
echo 'NODE_ENV=development' >> .env

# Generate Prisma Client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# Start backend
npm run dev
```

✅ Backend running on http://localhost:5000

### Step 4: Setup Frontend (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

### Step 5: Open Application

Open browser: **http://localhost:3000**

---

## First-Time Setup (5 minutes)

### 1. Create Your Company (1 min)

1. Click **"Create New Company"**
2. Fill in:
   - Company Name: "My Business"
   - Email: your@email.com
   - Phone: Your phone
3. Click **"Create Company"**
4. Select the company

### 2. Add First Item (1 min)

1. Click **"Items"**
2. Click **"Add New Item"**
3. Fill:
   - Item Code: "ITEM001"
   - Item Name: "Sample Product"
   - Category: "PRODUCT"
   - Unit: "PCS"
   - Purchase Price: 100
   - Selling Price: 150
   - Opening Stock: 50
4. Click **"Create Item"**

### 3. Create Ledger (1 min)

1. Click **"Ledgers"**
2. Click **"Add New Ledger"**
3. Fill:
   - Ledger Name: "Customer ABC"
   - Ledger Group: "SUNDRY_DEBTORS"
   - Opening Balance: 0
4. Click **"Create Ledger"**

### 4. Create First Voucher (2 min)

1. Click **"Vouchers"**
2. Click **"Create Voucher"**
3. Fill:
   - Voucher Number: "INV001"
   - Type: "SALES_INVOICE"
   - Date: Today
   - Party: "Customer ABC"
4. Add Item:
   - Select item
   - Quantity: 5
   - Click "Add Item"
5. Enter Amount Paid
6. Click **"Create Voucher"**

✅ **Done!** Your first transaction is complete with **ACID guarantee**!

---

## Key PostgreSQL Features You'll Love

### 1. Transaction Safety
When you create a voucher:
- ✅ Voucher created
- ✅ Items added
- ✅ Stock updated
- ✅ Ledger updated
- **All in one atomic transaction!**

If anything fails, everything rolls back automatically.

### 2. Data Integrity
- Can't delete ledger with vouchers
- Can't create voucher without valid items
- Foreign keys ensure consistency

### 3. Better Queries
```bash
# Open Prisma Studio (Database GUI)
npx prisma studio
```

Browse your database visually!

---

## Useful Commands

### Database Management

```bash
# View database
npx prisma studio

# Create new migration (after schema changes)
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: Deletes data)
npx prisma migrate reset

# Generate Prisma Client (after schema changes)
npx prisma generate
```

### PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d vyapar_erp

# List tables
\dt

# Describe table
\d companies

# View data
SELECT * FROM companies;

# Exit
\q
```

### Backup & Restore

```bash
# Backup
pg_dump -U postgres vyapar_erp > backup.sql

# Restore
psql -U postgres vyapar_erp < backup.sql
```

---

## Troubleshooting

### Backend won't start?

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS
docker ps  # Docker

# Test connection
psql -U postgres
```

### Migration failed?

```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Can't connect to database?

Check `.env` file:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/vyapar_erp?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

### Port already in use?

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Testing Transaction Safety

### Try This:

1. Create a sales voucher with 10 items
2. Stop the server mid-way (Ctrl+C)
3. Restart and check:
   - ✅ Either complete voucher exists
   - ✅ Or nothing exists
   - ❌ Never partial data!

This is the power of PostgreSQL transactions!

---

## What's Different from MongoDB Version?

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| Transactions | Limited | Full ACID |
| Relationships | Manual | Foreign Keys |
| Data Integrity | Application | Database |
| Complex Queries | Hard | Easy |
| Migrations | Manual | Automated |
| Type Safety | No | Yes (Prisma) |

---

## Next Steps

1. ✅ **Add more items** - Build your catalog
2. ✅ **Create customer/supplier ledgers**
3. ✅ **Generate invoices** - Watch transactions work!
4. ✅ **Check stock** - Auto-updated
5. ✅ **Explore Prisma Studio** - Visual database browser

---

## Pro Tips

### 1. Use Prisma Studio
```bash
npx prisma studio
```
Best way to explore your database!

### 2. Check Transaction Logs
PostgreSQL logs all operations. Great for debugging!

### 3. Regular Backups
```bash
# Add to cron (daily backup)
0 2 * * * pg_dump -U postgres vyapar_erp > /backups/vyapar_$(date +\%Y\%m\%d).sql
```

### 4. Monitor Performance
```sql
-- Slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

---

## Need Help?

**Common Issues:**
- Connection refused → Check if PostgreSQL is running
- Migration failed → Try `npx prisma migrate reset`
- Prisma not found → Run `npx prisma generate`

**Resources:**
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

## You're All Set! 🎉

**Your ERP is now running with:**
- ✅ PostgreSQL for reliability
- ✅ Prisma for type safety
- ✅ ACID transactions for data integrity
- ✅ Professional-grade architecture

Start managing your business! 🚀
