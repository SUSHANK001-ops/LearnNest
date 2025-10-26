import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
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
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution ID is required'],
    },
}, { timestamps: true });

// Index for better query performance
studentSchema.index({ institutionId: 1 });
studentSchema.index({ email: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
