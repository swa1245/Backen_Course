const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const Users = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  userId: { type: ObjectId },
  createdAt: { type: Date, default: Date.now }
});

const Course = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  creatorId: { type: ObjectId, ref: 'admins', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Admin = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Purchase = new Schema({
  userId: { type: ObjectId, ref: 'users', required: true },
  courseId: { type: ObjectId, ref: 'courses', required: true },
  purchaseDate: { type: Date, default: Date.now }
});

// Create indexes
Users.index({ email: 1 });
Course.index({ title: 1 });
Admin.index({ email: 1 });
Purchase.index({ userId: 1, courseId: 1 });

const userModel = mongoose.model("users", Users);
const courseModel = mongoose.model("courses", Course);

const adminModel = mongoose.model("admins", Admin);
const purchaseModel = mongoose.model("purchase", Purchase)

module.exports = { userModel, courseModel, adminModel, purchaseModel };

