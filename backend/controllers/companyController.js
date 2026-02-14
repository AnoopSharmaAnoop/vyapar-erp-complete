const prisma = require('../config/prisma');
const { createSystemLedgers } = require('../services/systemLedgerService');

// Create Company
exports.createCompany = async (req, res) => {
  try {
    // 1️⃣ Check duplicate company by email
    const existingCompany = await prisma.company.findUnique({
      where: { email: req.body.email },
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists',
      });
    }

    // 2️⃣ Create company
    const company = await prisma.company.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country || 'India',
        gstNumber: req.body.gstNumber,
        panNumber: req.body.panNumber,
        logo: req.body.logo,
        currency: req.body.currency || 'INR',
      },
    });

    // 3️⃣ AUTO-CREATE SYSTEM LEDGERS (OPTION 1 ✔)
    await createSystemLedgers(company.id);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    console.error('Create company error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create company',
    });
  }
};





// Get all Companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        gstNumber: true,
        panNumber: true,
        currency: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            ledgers: true,
            vouchers: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        _count: {
          select: {
            items: true,
            ledgers: true,
            vouchers: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Company
exports.updateCompany = async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Company (Soft Delete)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
