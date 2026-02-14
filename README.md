# VyaparERP - PostgreSQL Edition

A professional-grade ERP (Enterprise Resource Planning) application built with React, Node.js, and **PostgreSQL** with **Prisma ORM** for managing businesses, inventory, accounting ledgers, and vouchers.

## 🎯 Why PostgreSQL?

This version uses PostgreSQL instead of MongoDB for:
- ✅ **ACID Transactions**: Ensures data consistency for financial operations
- ✅ **Referential Integrity**: Foreign keys prevent orphaned records
- ✅ **Complex Queries**: Better support for reporting and analytics
- ✅ **Data Consistency**: Critical for accounting applications
- ✅ **Industry Standard**: Used by most enterprise ERP systems
- ✅ **Better for Auditing**: Compliance and financial reporting

## Features

### 1. Company Management
- Create and manage multiple companies
- Store complete company details (GST, PAN, address)
- Switch between companies seamlessly
- Company-specific data isolation

### 2. Items/Inventory Management
- Complete item catalog with categories
- Real-time stock tracking with ACID guarantees
- Automatic stock updates via transactions
- Low stock alerts
- HSN code and tax configuration
- Multiple units and pricing tiers

### 3. Ledger/Accounting
- 16 predefined ledger groups
- Party management (customers/suppliers)
- Opening and current balance tracking
- Credit limit and terms
- Foreign key constraints ensure data integrity

### 4. Voucher Management
- **Transaction-safe voucher creation**
- Multiple voucher types (Sales, Purchase, Payment, etc.)
- Automatic stock and ledger updates in single transaction
- Payment tracking with status management
- Rollback on errors (no partial data)

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client
- **CORS** - Cross-origin support

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Vite** - Build tool

## Database Schema (PostgreSQL)

### Key Relationships
```
Company (1) ──→ (N) Items
Company (1) ──→ (N) Ledgers
Company (1) ──→ (N) Vouchers
Ledger (1) ──→ (N) Vouchers
Item (1) ──→ (N) VoucherItems
Voucher (1) ──→ (N) VoucherItems
```

### Constraints & Features
- **CASCADE DELETE**: Deleting company removes all related data
- **RESTRICT DELETE**: Cannot delete ledger with active vouchers
- **UNIQUE CONSTRAINTS**: Prevents duplicate emails, item codes, voucher numbers
- **INDEXES**: Fast queries on frequently accessed columns
- **ENUMS**: Type-safe status and category values

## Installation & Setup

### Prerequisites
1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** (v8 or higher)

### PostgreSQL Setup

#### Option 1: Install PostgreSQL Locally

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On macOS (with Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and start PostgreSQL service

#### Option 2: Use Docker
```bash
docker run --name vyapar-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vyapar_erp \
  -p 5432:5432 \
  -d postgres:14
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vyapar_erp;

# Exit
\q
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env` file:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/vyapar_erp?schema=public"
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Important**: Update the `DATABASE_URL` with your PostgreSQL credentials:
- `postgres` - your PostgreSQL username
- `password` - your PostgreSQL password
- `localhost:5432` - host and port
- `vyapar_erp` - database name

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev --name init
```

This creates all tables, relationships, and indexes.

6. (Optional) View database with Prisma Studio:
```bash
npx prisma studio
```

7. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend runs on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:3000

## Prisma Commands

### Useful Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

### Database Migrations

When you modify `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# This will:
# 1. Create SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma Client
```

## API Endpoints

All endpoints remain the same as MongoDB version:

### Company Endpoints
- `POST /api/companies` - Create company
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Soft delete

### Item Endpoints
- `POST /api/items` - Create item
- `GET /api/items/company/:companyId` - Get company items
- `GET /api/items/low-stock/:companyId` - Low stock items
- `GET /api/items/:id` - Get item
- `PUT /api/items/:id` - Update item
- `PUT /api/items/:id/stock` - Update stock
- `DELETE /api/items/:id` - Soft delete

### Ledger Endpoints
- `POST /api/ledgers` - Create ledger
- `GET /api/ledgers/company/:companyId` - Get ledgers
- `GET /api/ledgers/groups` - Get ledger groups
- `GET /api/ledgers/:id` - Get ledger
- `PUT /api/ledgers/:id` - Update ledger
- `PUT /api/ledgers/:id/balance` - Update balance
- `DELETE /api/ledgers/:id` - Soft delete

### Voucher Endpoints
- `POST /api/vouchers` - Create voucher (with transaction)
- `GET /api/vouchers/company/:companyId` - Get vouchers
- `GET /api/vouchers/summary/:companyId` - Get summary
- `GET /api/vouchers/:id` - Get voucher
- `PUT /api/vouchers/:id` - Update voucher
- `PUT /api/vouchers/:id/payment` - Update payment
- `DELETE /api/vouchers/:id` - Delete (with stock reversal)

## Transaction Support (Key Feature)

### Voucher Creation with ACID Transactions

When creating a voucher, the system performs multiple operations atomically:

```javascript
await prisma.$transaction(async (tx) => {
  // 1. Create voucher
  // 2. Create voucher items
  // 3. Update item stock
  // 4. Update ledger balance
  // All succeed or all fail together
});
```

**Benefits:**
- No partial updates (all or nothing)
- Data consistency guaranteed
- Automatic rollback on errors
- No orphaned records

### Example Scenarios

#### Scenario 1: Successful Transaction
```
1. Create sales voucher → ✅
2. Add voucher items → ✅
3. Reduce item stock → ✅
4. Update customer ledger → ✅
Result: All changes committed ✅
```

#### Scenario 2: Failed Transaction
```
1. Create sales voucher → ✅
2. Add voucher items → ✅
3. Reduce item stock → ❌ (Insufficient stock)
Result: Everything rolled back ↩️ (No changes saved)
```

## Advantages Over MongoDB Version

### 1. Data Integrity
- Foreign key constraints prevent invalid references
- Cannot delete ledger if vouchers exist
- Enum types ensure valid values

### 2. Transaction Support
- True ACID transactions
- No partial voucher creation
- Stock and balance always in sync

### 3. Query Performance
- Optimized indexes
- Efficient JOINs for reports
- Better aggregation queries

### 4. Type Safety
- Prisma generates TypeScript types
- Compile-time error checking
- Auto-completion in IDEs

### 5. Migrations
- Version-controlled schema changes
- Rollback capabilities
- Team collaboration friendly

### 6. Reporting
```sql
-- Easy complex queries
SELECT 
  l.ledger_name,
  SUM(v.total_amount) as total_sales
FROM vouchers v
JOIN ledgers l ON v.party_id = l.id
WHERE v.voucher_type = 'SALES_INVOICE'
GROUP BY l.ledger_name;
```

## Usage Guide

Usage is identical to MongoDB version. Key difference is improved reliability:

### Creating a Voucher

1. Navigate to Vouchers page
2. Click "Create Voucher"
3. Fill details and add items
4. Click "Create Voucher"

**Behind the scenes:**
- System starts PostgreSQL transaction
- Creates voucher record
- Adds all voucher items
- Updates stock for each item
- Updates party ledger balance
- If any step fails, entire operation rolls back
- If all succeed, transaction commits

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Test connection
psql -U postgres -d vyapar_erp
```

### Migration Errors

```bash
# Reset database (WARNING: Deletes data)
npx prisma migrate reset

# Force migration
npx prisma migrate deploy --force
```

### Prisma Client Not Found

```bash
# Regenerate Prisma Client
npx prisma generate
```

### Port Already in Use

```bash
# Kill process on port 5432 (PostgreSQL)
sudo lsof -ti:5432 | xargs kill -9

# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9
```

## Production Deployment

### Database

1. Use managed PostgreSQL service:
   - AWS RDS
   - Google Cloud SQL
   - Heroku Postgres
   - DigitalOcean Managed Database

2. Update DATABASE_URL in production environment

3. Run migrations:
```bash
npx prisma migrate deploy
```

### Backend

1. Set environment variables
2. Build if using TypeScript
3. Use PM2 or similar for process management
4. Enable HTTPS

### Frontend

```bash
npm run build
# Deploy dist folder to Netlify, Vercel, or AWS S3
```

## Backup & Restore

### Backup Database
```bash
pg_dump -U postgres vyapar_erp > backup.sql
```

### Restore Database
```bash
psql -U postgres vyapar_erp < backup.sql
```

### Automated Backups
Set up cron job or use cloud provider's automated backup service.

## Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Database User**: Create separate user with limited permissions
3. **Password**: Use strong database passwords
4. **SSL**: Enable SSL for PostgreSQL connections in production
5. **Input Validation**: Prisma helps prevent SQL injection
6. **Rate Limiting**: Add rate limiting middleware

## Performance Tips

1. **Indexes**: Already optimized in schema
2. **Connection Pooling**: Prisma handles automatically
3. **Query Optimization**: Use Prisma's query analysis
4. **Caching**: Add Redis for frequently accessed data
5. **Pagination**: Implement for large datasets

## Future Enhancements

- User authentication with JWT
- Role-based access control
- Advanced reporting dashboard
- PDF invoice generation
- Email notifications
- Audit logs
- Multi-currency support
- Mobile application

## Support

For issues:
1. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
2. Check application logs
3. Use Prisma Studio to inspect database
4. Review migration files in `prisma/migrations`

## License

MIT

---

**Built with PostgreSQL for enterprise-grade reliability** 🚀
