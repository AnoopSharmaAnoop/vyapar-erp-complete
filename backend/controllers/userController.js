const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const users = await prisma.user.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  console.log("reached for finding");
  alert("reached");
  try {
    const userId = parseInt(req.params.id);
    const companyId = req.user.companyId;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
else
{
return res.status(201).json({
        success: true,
        message: 'User  found',
      });
}

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create user (from register - companyId from token)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const companyId = req.user.companyId; // From JWT token

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyId: companyId, // From JWT token, not from request body
        role: role || 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    const { name, email, password } = req.body;

    // Verify user belongs to same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or access denied',
      });
    }

    // Prepare update data
    const updateData = {
      name,
      email,
    };

    // Hash password if provided
    if (password && password.length >= 8) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    const { role } = req.body;

    // Verify user belongs to same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or access denied',
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete (deactivate) user
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const companyId = req.user.companyId;

    // Verify user belongs to same company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or access denied',
      });
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};