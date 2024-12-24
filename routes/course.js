const { Router } = require('express');
const { userMiddleware } = require('../middlewares/user');
const { purchaseModel, courseModel } = require('../db');

const courseRouter = Router();

courseRouter.post('/purchase', userMiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                message: "Course ID is required"
            });
        }

        // Verify course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Check if user has already purchased the course
        const existingPurchase = await purchaseModel.findOne({
            userId,
            courseId
        });

        if (existingPurchase) {
            return res.status(409).json({
                message: "You have already purchased this course"
            });
        }

        // Create purchase record
        await purchaseModel.create({
            userId,
            courseId,
            purchaseDate: new Date()
        });

        res.status(201).json({
            message: "Course purchased successfully"
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({
            message: "Error processing purchase"
        });
    }
});

courseRouter.get('/preview', async function(req, res) {
    try {
        const courses = await courseModel.find({})
            .select('title description price image')
            .lean();

        res.json({
            courses: courses.map(course => ({
                id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                image: course.image
            }))
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            message: "Error fetching courses"
        });
    }
});

module.exports = {
    courseRouter
};