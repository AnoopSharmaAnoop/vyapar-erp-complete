// Tax Calculation Utilities for VyaparERP

/**
 * Calculate GST breakdown for an amount
 * @param {number} amount - Base amount (taxable value)
 * @param {number} gstRate - Total GST rate (e.g., 18 for 18%)
 * @param {string} gstType - 'GST' (intrastate) or 'IGST' (interstate)
 * @param {number} cessRate - Cess rate if applicable
 * @returns {object} - Tax breakdown
 */
exports.calculateGST = (amount, gstRate = 0, gstType = 'GST', cessRate = 0) => {
  const taxableAmount = parseFloat(amount);
  
  let cgstRate = 0;
  let sgstRate = 0;
  let igstRate = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let cessAmount = 0;
  
  if (gstType === 'GST') {
    // Intrastate: CGST + SGST
    cgstRate = gstRate / 2;
    sgstRate = gstRate / 2;
    cgstAmount = (taxableAmount * cgstRate) / 100;
    sgstAmount = (taxableAmount * sgstRate) / 100;
  } else if (gstType === 'IGST') {
    // Interstate: IGST
    igstRate = gstRate;
    igstAmount = (taxableAmount * igstRate) / 100;
  }
  
  // Calculate Cess if applicable
  if (cessRate > 0) {
    cessAmount = (taxableAmount * cessRate) / 100;
  }
  
  const totalTax = cgstAmount + sgstAmount + igstAmount + cessAmount;
  const totalAmount = taxableAmount + totalTax;
  
  return {
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    cgstRate: parseFloat(cgstRate.toFixed(2)),
    cgstAmount: parseFloat(cgstAmount.toFixed(2)),
    sgstRate: parseFloat(sgstRate.toFixed(2)),
    sgstAmount: parseFloat(sgstAmount.toFixed(2)),
    igstRate: parseFloat(igstRate.toFixed(2)),
    igstAmount: parseFloat(igstAmount.toFixed(2)),
    cessRate: parseFloat(cessRate.toFixed(2)),
    cessAmount: parseFloat(cessAmount.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

/**
 * Calculate TDS (Tax Deducted at Source)
 * @param {number} amount - Gross amount
 * @param {number} tdsRate - TDS rate percentage
 * @returns {object} - TDS breakdown
 */
exports.calculateTDS = (amount, tdsRate = 0) => {
  const grossAmount = parseFloat(amount);
  const tdsAmount = (grossAmount * tdsRate) / 100;
  const netAmount = grossAmount - tdsAmount;
  
  return {
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    tdsRate: parseFloat(tdsRate.toFixed(2)),
    tdsAmount: parseFloat(tdsAmount.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2)),
  };
};

/**
 * Calculate TCS (Tax Collected at Source)
 * @param {number} amount - Sale amount
 * @param {number} tcsRate - TCS rate percentage
 * @returns {object} - TCS breakdown
 */
exports.calculateTCS = (amount, tcsRate = 0) => {
  const saleAmount = parseFloat(amount);
  const tcsAmount = (saleAmount * tcsRate) / 100;
  const totalAmount = saleAmount + tcsAmount;
  
  return {
    saleAmount: parseFloat(saleAmount.toFixed(2)),
    tcsRate: parseFloat(tcsRate.toFixed(2)),
    tcsAmount: parseFloat(tcsAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

/**
 * Calculate item-wise tax for voucher
 * @param {array} items - Array of items with quantity, rate, discount
 * @param {object} taxSettings - Tax settings from company/ledger
 * @returns {object} - Complete voucher calculation
 */
exports.calculateVoucherTax = (items, taxSettings = {}) => {
  const {
    gstType = 'GST',
    placeOfSupply = null,
    companyState = null,
    tdsRate = 0,
    tcsRate = 0,
  } = taxSettings;
  
  // Determine if interstate or intrastate
  const isInterstate = placeOfSupply && companyState && placeOfSupply !== companyState;
  const finalGstType = isInterstate ? 'IGST' : 'GST';
  
  let subTotal = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalCess = 0;
  
  const processedItems = items.map(item => {
    const quantity = parseFloat(item.quantity);
    const rate = parseFloat(item.rate);
    const discountPercent = parseFloat(item.discountPercent || 0);
    const gstRate = parseFloat(item.gstRate || 0);
    const cessRate = parseFloat(item.cessRate || 0);
    
    // Calculate item value
    const itemTotal = quantity * rate;
    const discountAmount = (itemTotal * discountPercent) / 100;
    const taxableAmount = itemTotal - discountAmount;
    
    // Calculate GST
    const taxCalc = exports.calculateGST(taxableAmount, gstRate, finalGstType, cessRate);
    
    subTotal += itemTotal;
    totalDiscount += discountAmount;
    totalTaxable += taxableAmount;
    totalCGST += taxCalc.cgstAmount;
    totalSGST += taxCalc.sgstAmount;
    totalIGST += taxCalc.igstAmount;
    totalCess += taxCalc.cessAmount;
    
    return {
      ...item,
      itemTotal: parseFloat(itemTotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      discountPercent,
      taxableAmount: taxCalc.taxableAmount,
      cgstRate: taxCalc.cgstRate,
      cgstAmount: taxCalc.cgstAmount,
      sgstRate: taxCalc.sgstRate,
      sgstAmount: taxCalc.sgstAmount,
      igstRate: taxCalc.igstRate,
      igstAmount: taxCalc.igstAmount,
      cessRate: taxCalc.cessRate,
      cessAmount: taxCalc.cessAmount,
      totalTax: taxCalc.totalTax,
      amount: taxCalc.totalAmount,
    };
  });
  
  const totalTax = totalCGST + totalSGST + totalIGST + totalCess;
  let grandTotal = totalTaxable + totalTax;
  
  // Apply TDS if applicable (reduces amount receivable/payable)
  let tdsAmount = 0;
  if (tdsRate > 0) {
    const tds = exports.calculateTDS(totalTaxable, tdsRate);
    tdsAmount = tds.tdsAmount;
  }
  
  // Apply TCS if applicable (increases amount receivable)
  let tcsAmount = 0;
  if (tcsRate > 0) {
    const tcs = exports.calculateTCS(grandTotal, tcsRate);
    tcsAmount = tcs.tcsAmount;
    grandTotal = tcs.totalAmount;
  }
  
  // Round off
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;
  
  return {
    items: processedItems,
    subTotal: parseFloat(subTotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalTaxable: parseFloat(totalTaxable.toFixed(2)),
    cgstAmount: parseFloat(totalCGST.toFixed(2)),
    sgstAmount: parseFloat(totalSGST.toFixed(2)),
    igstAmount: parseFloat(totalIGST.toFixed(2)),
    cessAmount: parseFloat(totalCess.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    tdsAmount: parseFloat(tdsAmount.toFixed(2)),
    tcsAmount: parseFloat(tcsAmount.toFixed(2)),
    roundOff: parseFloat(roundOff.toFixed(2)),
    totalAmount: roundedTotal,
  };
};

/**
 * Get applicable GST rate based on HSN/SAC code
 * @param {string} hsnCode - HSN or SAC code
 * @returns {number} - GST rate
 */
exports.getGSTRateByHSN = (hsnCode) => {
  // This should ideally be a database lookup
  // Simplified mapping for common items
  const hsnRates = {
    // Food items - 5%
    '0401': 5, // Milk
    '1001': 5, // Wheat
    
    // Textiles - 5% or 12%
    '5208': 5,  // Cotton fabrics
    '6109': 12, // T-shirts
    
    // Electronics - 18%
    '8517': 18, // Phones
    '8528': 18, // Monitors
    
    // Vehicles - 28%
    '8703': 28, // Cars
    '8711': 28, // Motorcycles
    
    // Services - 18%
    '998314': 18, // Professional services
    '998313': 18, // Consulting
  };
  
  // Try to match by first 4 digits, then 2 digits
  if (hsnCode) {
    const code4 = hsnCode.substring(0, 4);
    const code2 = hsnCode.substring(0, 2);
    
    return hsnRates[code4] || hsnRates[code2] || 18; // Default 18%
  }
  
  return 18; // Default GST rate
};

/**
 * Validate GST Number
 * @param {string} gstNumber - GST number to validate
 * @returns {object} - Validation result
 */
exports.validateGSTNumber = (gstNumber) => {
  if (!gstNumber) {
    return { valid: false, message: 'GST number is required' };
  }
  
  // GST format: 2 digits state code + 10 digits PAN + 1 digit entity + 1 digit Z + 1 check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(gstNumber)) {
    return { valid: false, message: 'Invalid GST number format' };
  }
  
  // Extract state code
  const stateCode = gstNumber.substring(0, 2);
  
  // Extract PAN
  const pan = gstNumber.substring(2, 12);
  
  return {
    valid: true,
    stateCode,
    pan,
    message: 'Valid GST number',
  };
};

/**
 * Calculate reverse charge (if applicable)
 * @param {number} amount - Invoice amount
 * @param {boolean} isReverseCharge - Whether reverse charge applies
 * @param {number} gstRate - GST rate
 * @returns {object} - Reverse charge calculation
 */
exports.calculateReverseCharge = (amount, isReverseCharge = false, gstRate = 18) => {
  if (!isReverseCharge) {
    return {
      invoiceAmount: amount,
      reverseChargeApplicable: false,
      gstPayableByRecipient: 0,
    };
  }
  
  const gstAmount = (amount * gstRate) / 100;
  
  return {
    invoiceAmount: parseFloat(amount.toFixed(2)),
    reverseChargeApplicable: true,
    gstRate,
    gstPayableByRecipient: parseFloat(gstAmount.toFixed(2)),
    message: 'GST to be paid by recipient under reverse charge mechanism',
  };
};

/**
 * Calculate depreciation
 * @param {number} assetValue - Original value of asset
 * @param {number} rate - Depreciation rate percentage
 * @param {string} method - 'SLM' or 'WDV'
 * @param {number} years - Number of years
 * @returns {object} - Depreciation schedule
 */
exports.calculateDepreciation = (assetValue, rate, method = 'WDV', years = 1) => {
  const originalValue = parseFloat(assetValue);
  const depRate = parseFloat(rate);
  
  if (method === 'SLM') {
    // Straight Line Method
    const annualDepreciation = (originalValue * depRate) / 100;
    const totalDepreciation = annualDepreciation * years;
    const writtenDownValue = originalValue - totalDepreciation;
    
    return {
      method: 'SLM',
      originalValue: parseFloat(originalValue.toFixed(2)),
      depreciationRate: depRate,
      years,
      annualDepreciation: parseFloat(annualDepreciation.toFixed(2)),
      totalDepreciation: parseFloat(totalDepreciation.toFixed(2)),
      writtenDownValue: parseFloat(writtenDownValue.toFixed(2)),
    };
  } else {
    // Written Down Value Method
    let wdv = originalValue;
    const schedule = [];
    
    for (let year = 1; year <= years; year++) {
      const depreciation = (wdv * depRate) / 100;
      wdv -= depreciation;
      schedule.push({
        year,
        openingWDV: parseFloat((wdv + depreciation).toFixed(2)),
        depreciation: parseFloat(depreciation.toFixed(2)),
        closingWDV: parseFloat(wdv.toFixed(2)),
      });
    }
    
    const totalDepreciation = originalValue - wdv;
    
    return {
      method: 'WDV',
      originalValue: parseFloat(originalValue.toFixed(2)),
      depreciationRate: depRate,
      years,
      schedule,
      totalDepreciation: parseFloat(totalDepreciation.toFixed(2)),
      writtenDownValue: parseFloat(wdv.toFixed(2)),
    };
  }
};

module.exports = exports;
