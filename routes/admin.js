const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_ADMIN } = require('../config');
const { adminMiddleware } = require("../middlewares/admin");

adminRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await adminModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    res.status(201).json({
      message: "Admin created successfully",
      adminId: admin._id
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      message: "Internal server error during signup"
    });
  }
});

adminRouter.post("/signin", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: admin._id.toString() },
      JWT_ADMIN,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: "Internal server error during login"
    });
  }
});

adminRouter.post("/course", adminMiddleware, async function (req, res) {
  try {
    const adminId = req.userId;
    const { title, description, image, price } = req.body;

    // Input validation
    if (!title || !description || !image || !price) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative"
      });
    }

    const course = await courseModel.create({
      title,
      description,
      image,
      price,
      creatorId: adminId
    });

    res.status(201).json({
      message: "Course created successfully",
      courseId: course._id
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({
      message: "Error creating course"
    });
  }
});

adminRouter.put("/course", adminMiddleware, async function (req, res) {
  try {
    const adminId = req.userId;
    const { courseId, title, description, image, price } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required"
      });
    }

    // Verify course exists and belongs to admin
    const existingCourse = await courseModel.findOne({
      _id: courseId,
      creatorId: adminId
    });

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found or unauthorized"
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
    if (typeof price !== 'undefined') {
      if (price < 0) {
        return res.status(400).json({
          message: "Price cannot be negative"
        });
      }
      updateData.price = price;
    }

    await courseModel.updateOne(
      { _id: courseId, creatorId: adminId },
      updateData
    );

    res.json({
      message: "Course updated successfully"
    });
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({
      message: "Error updating course"
    });
  }
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
  try {
    const adminId = req.userId;
    const courses = await courseModel.find({
      creatorId: adminId
    });

    res.json({
      message: "Courses retrieved successfully",
      courses
    });
  } catch (error) {
    console.error('Course retrieval error:', error);
    res.status(500).json({
      message: "Error retrieving courses"
    });
  }
});

module.exports = {
  adminRouter
};
