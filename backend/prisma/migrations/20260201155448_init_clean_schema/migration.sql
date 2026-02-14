-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'MANAGER', 'SALES_USER', 'PURCHASE_USER', 'USER');

-- CreateEnum
CREATE TYPE "AccountingMethod" AS ENUM ('CASH', 'ACCRUAL');

-- CreateEnum
CREATE TYPE "DepreciationMethod" AS ENUM ('SLM', 'WDV');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('PRODUCT', 'SERVICE', 'RAW_MATERIAL', 'FINISHED_GOODS', 'WORK_IN_PROGRESS', 'CONSUMABLES');

-- CreateEnum
CREATE TYPE "ItemUnit" AS ENUM ('PCS', 'KG', 'GRAM', 'LTR', 'ML', 'MTR', 'CM', 'BOX', 'DOZEN', 'QUINTAL', 'TON', 'SQFT', 'SQMTR');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('NONE', 'GST', 'IGST');

-- CreateEnum
CREATE TYPE "TaxPreference" AS ENUM ('TAXABLE', 'EXEMPT', 'NIL_RATED');

-- CreateEnum
CREATE TYPE "LedgerGroup" AS ENUM ('ASSETS', 'CURRENT_ASSETS', 'FIXED_ASSETS', 'INVESTMENTS', 'LIABILITIES', 'CURRENT_LIABILITIES', 'LONG_TERM_LIABILITIES', 'CAPITAL', 'RESERVES_SURPLUS', 'INCOME', 'SALES_ACCOUNTS', 'DIRECT_INCOME', 'INDIRECT_INCOME', 'EXPENSES', 'PURCHASE_ACCOUNTS', 'DIRECT_EXPENSES', 'INDIRECT_EXPENSES', 'SUNDRY_DEBTORS', 'SUNDRY_CREDITORS', 'CASH_IN_HAND', 'BANK_ACCOUNTS', 'BANK_OD_ACCOUNTS', 'DUTIES_TAXES', 'PROVISIONS', 'LOANS_LIABILITY', 'LOANS_ASSETS', 'SUSPENSE_ACCOUNTS');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('SALES_INVOICE', 'PURCHASE_INVOICE', 'SALES_RETURN', 'PURCHASE_RETURN', 'PAYMENT', 'RECEIPT', 'JOURNAL', 'CONTRA', 'DEBIT_NOTE', 'CREDIT_NOTE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK', 'CREDIT', 'UPI', 'CHEQUE', 'CARD', 'NEFT', 'RTGS', 'IMPS');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('OPENING_STOCK', 'PURCHASE', 'SALES', 'SALES_RETURN', 'PURCHASE_RETURN', 'STOCK_TRANSFER', 'DAMAGE', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "permissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "tanNumber" TEXT,
    "logo" TEXT,
    "financialYearStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financialYearEnd" TIMESTAMP(3),
    "booksStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gstEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tdsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tcsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "accountingMethod" "AccountingMethod" NOT NULL DEFAULT 'ACCRUAL',
    "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'WDV',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "taxName" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledgers" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "ledgerCode" TEXT NOT NULL,
    "ledgerName" TEXT NOT NULL,
    "ledgerGroup" "LedgerGroup" NOT NULL,
    "ledgerType" "LedgerType" NOT NULL,
    "parentLedger" INTEGER,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "creditLimit" DOUBLE PRECISION,
    "creditDays" INTEGER,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "branch" TEXT,
    "tdsApplicable" BOOLEAN NOT NULL DEFAULT false,
    "tdsRate" DOUBLE PRECISION,
    "tcsApplicable" BOOLEAN NOT NULL DEFAULT false,
    "tcsRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "description" TEXT,
    "unit" "ItemUnit" NOT NULL,
    "hsnCode" TEXT,
    "sacCode" TEXT,
    "openingStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStockLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStockLevel" DOUBLE PRECISION,
    "reorderLevel" DOUBLE PRECISION,
    "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mrp" DOUBLE PRECISION,
    "marginPercent" DOUBLE PRECISION,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cessRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxType" "TaxType" NOT NULL DEFAULT 'NONE',
    "taxPreference" "TaxPreference" NOT NULL DEFAULT 'TAXABLE',
    "godownLocation" TEXT,
    "rackNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "voucherId" INTEGER,
    "rate" DOUBLE PRECISION,
    "quantityIn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantityOut" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "voucherType" "VoucherType" NOT NULL,
    "voucherDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTaxable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cessAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tdsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tcsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "narration" TEXT,
    "referenceNumber" TEXT,
    "dueDate" TIMESTAMP(3),
    "placeOfSupply" TEXT,
    "taxInvoiceNumber" TEXT,
    "taxInvoiceDate" TIMESTAMP(3),
    "transportMode" TEXT,
    "vehicleNumber" TEXT,
    "lrNumber" TEXT,
    "eWayBillNumber" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_items" (
    "id" SERIAL NOT NULL,
    "voucherId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sgstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "igstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cessRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cessAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voucher_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "voucherId" INTEGER,
    "ledgerId" INTEGER NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "narration" TEXT,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_companyId_idx" ON "audit_logs"("companyId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE INDEX "companies_email_idx" ON "companies"("email");

-- CreateIndex
CREATE INDEX "tax_rates_companyId_idx" ON "tax_rates"("companyId");

-- CreateIndex
CREATE INDEX "ledgers_companyId_idx" ON "ledgers"("companyId");

-- CreateIndex
CREATE INDEX "ledgers_ledgerGroup_idx" ON "ledgers"("ledgerGroup");

-- CreateIndex
CREATE UNIQUE INDEX "ledgers_companyId_ledgerCode_key" ON "ledgers"("companyId", "ledgerCode");

-- CreateIndex
CREATE UNIQUE INDEX "ledgers_companyId_ledgerName_key" ON "ledgers"("companyId", "ledgerName");

-- CreateIndex
CREATE INDEX "items_companyId_idx" ON "items"("companyId");

-- CreateIndex
CREATE INDEX "items_itemCode_idx" ON "items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "items_companyId_itemCode_key" ON "items"("companyId", "itemCode");

-- CreateIndex
CREATE INDEX "stock_movements_itemId_idx" ON "stock_movements"("itemId");

-- CreateIndex
CREATE INDEX "stock_movements_companyId_idx" ON "stock_movements"("companyId");

-- CreateIndex
CREATE INDEX "stock_movements_movementDate_idx" ON "stock_movements"("movementDate");

-- CreateIndex
CREATE INDEX "vouchers_companyId_idx" ON "vouchers"("companyId");

-- CreateIndex
CREATE INDEX "vouchers_voucherType_idx" ON "vouchers"("voucherType");

-- CreateIndex
CREATE INDEX "vouchers_status_idx" ON "vouchers"("status");

-- CreateIndex
CREATE INDEX "vouchers_voucherDate_idx" ON "vouchers"("voucherDate");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_companyId_voucherNumber_key" ON "vouchers"("companyId", "voucherNumber");

-- CreateIndex
CREATE INDEX "voucher_items_voucherId_idx" ON "voucher_items"("voucherId");

-- CreateIndex
CREATE INDEX "voucher_items_itemId_idx" ON "voucher_items"("itemId");

-- CreateIndex
CREATE INDEX "journal_entries_companyId_idx" ON "journal_entries"("companyId");

-- CreateIndex
CREATE INDEX "journal_entries_voucherId_idx" ON "journal_entries"("voucherId");

-- CreateIndex
CREATE INDEX "journal_entries_ledgerId_idx" ON "journal_entries"("ledgerId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_items" ADD CONSTRAINT "voucher_items_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_items" ADD CONSTRAINT "voucher_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
