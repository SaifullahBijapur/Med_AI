require("dotenv").config();
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role, hospitalId) => {
  return jwt.sign(
    { id, role, hospitalId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// ==================== SUPERADMIN REGISTRATION (One-time setup) ====================
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Super admin already exists. Only one super admin is allowed.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      // No hospitalId for superadmin
    });

    const token = generateToken(user._id, user.role, null);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== HOSPITAL ADMIN REGISTRATION ====================
exports.registerHospitalAdmin = async (req, res) => {
  try {
    const { name, email, password, hospitalId } = req.body;

    // Only superadmin can create hospital admins
    if (req.userRole !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create hospital admins.",
      });
    }

    // Validate hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "hospital_admin",
      hospitalId,
    });

    const token = generateToken(user._id, user.role, hospitalId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REGULAR USER REGISTRATION (Patient/Doctor/Receptionist) ====================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId, phone } = req.body;

    // Validate role
    const allowedRoles = ["patient", "doctor", "receptionist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed: patient, doctor, receptionist",
      });
    }

    // Only hospital_admin can create users in their hospital
    if (req.userRole !== "superadmin" && req.userRole !== "hospital_admin") {
      return res.status(403).json({
        success: false,
        message: "Only hospital admin can register users.",
      });
    }

    // Hospital admin can only create users in their hospital
    if (req.userRole === "hospital_admin" && String(hospitalId) !== String(req.hospitalId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create users for your hospital.",
      });
    }

    // Validate hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      hospitalId,
      phone: phone || "",
    });

    const token = generateToken(user._id, user.role, hospitalId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact admin.",
      });
    }

    // Google account check
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id, user.role, user.hospitalId);

    // Get hospital info if applicable
    let hospital = null;
    if (user.hospitalId) {
      hospital = await Hospital.findById(user.hospitalId).select("name slug status");
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
        hospital: hospital
          ? { id: hospital._id, name: hospital.name, slug: hospital.slug, status: hospital.status }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GOOGLE LOGIN ====================
exports.googleLogin = async (req, res) => {
  try {
    const { tokenId, role, hospitalId } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // New user - need role and hospitalId for non-superadmin
      if (role && role !== "superadmin" && !hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required for new users.",
        });
      }

      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: role || "patient",
        hospitalId: hospitalId || null,
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact admin.",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id, user.role, user.hospitalId);

    let hospital = null;
    if (user.hospitalId) {
      hospital = await Hospital.findById(user.hospitalId).select("name slug status");
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
        hospital: hospital
          ? { id: hospital._id, name: hospital.name, slug: hospital.slug, status: hospital.status }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET CURRENT USER ====================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let hospital = null;
    if (user.hospitalId) {
      hospital = await Hospital.findById(user.hospitalId).select("name slug status departments settings");
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        hospital,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LIST USERS (Hospital Admin only) ====================
exports.listUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { hospitalId: req.hospitalId };

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE USER ====================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, isActive, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Can only update users in your hospital (superadmin can update anyone)
    if (req.userRole !== "superadmin" && String(user.hospitalId) !== String(req.hospitalId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Only superadmin can change roles
    if (role && req.userRole !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only super admin can change roles" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role && req.userRole === "superadmin") updateData.role = role;

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    res.status(200).json({ success: true, user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE USER ====================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Cannot delete superadmin
    if (user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot delete super admin" });
    }

    // Can only delete users in your hospital
    if (req.userRole !== "superadmin" && String(user.hospitalId) !== String(req.hospitalId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
