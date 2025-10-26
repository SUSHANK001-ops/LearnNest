import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Teacher name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution ID is required'],
    },
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
}, { timestamps: true });

// Index for better query performance
teacherSchema.index({ institutionId: 1 });
teacherSchema.index({ email: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
