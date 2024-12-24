const { Router } = require('express');
const { userModel, purchaseModel, courseModel } = require('../db');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { JWT_USER } = require('../config');
const { userMiddleware } = require('../middlewares/user');
const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
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

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: "Internal server error during signup"
    });
  }
});

userRouter.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_USER,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "Internal server error during login"
    });
  }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
  try {
    const purchases = await purchaseModel
      .find({ userId: req.userId })
      .populate('courseId', 'title description price');

    res.json({
      purchases: purchases.map(p => ({
        purchaseId: p._id,
        purchaseDate: p.purchaseDate,
        course: p.courseId
      }))
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      message: "Error fetching purchase history"
    });
  }
});

module.exports = {
  userRouter
};
