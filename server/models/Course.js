import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null,
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution ID is required'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required'],
    },
}, { timestamps: true });

// Index for better query performance
courseSchema.index({ institutionId: 1 });
courseSchema.index({ teacher: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
