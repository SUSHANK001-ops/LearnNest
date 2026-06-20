import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';

// @desc    Bulk import students from Excel/CSV
// @route   POST /api/bulk-import/students
// @access  Institution Admin
export const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel/CSV file' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    const results = { created: 0, errors: [], skipped: 0 };
    const tempPassword = 'TempPass@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Account for header row

      try {
        const name = row['Full Name'] || row['Name'] || row['name'] || row['full_name'];
        const email = row['Email'] || row['email'];
        const phone = row['Phone'] || row['phone'] || '';
        const department = row['Department'] || row['department'] || '';
        const semester = row['Semester'] || row['semester'] || '';
        const studentId = row['Student ID'] || row['student_id'] || row['StudentID'] || '';

        if (!name || !email) {
          results.errors.push({ row: rowNum, error: 'Missing required fields (Full Name, Email)' });
          continue;
        }

        // Check if email already exists
        const existingStudent = await prisma.student.findUnique({ where: { email } });
        if (existingStudent) {
          results.skipped++;
          results.errors.push({ row: rowNum, error: `Student with email ${email} already exists` });
          continue;
        }

        // Create student + user account in a transaction
        await prisma.$transaction(async (tx) => {
          // Create user account
          const username = email.split('@')[0] + '_' + Date.now().toString(36);
          const user = await tx.user.create({
            data: {
              firstname: name.split(' ')[0],
              lastname: name.split(' ').slice(1).join(' ') || '',
              username,
              email,
              password: hashedPassword,
              phone: String(phone),
              department,
              semester: String(semester),
              studentIdCode: String(studentId),
              role: 'student',
              institutionId: req.user.institutionId,
              isFirstLogin: true
            }
          });

          // Create student profile
          await tx.student.create({
            data: {
              name,
              email,
              phone: String(phone),
              department,
              semester: String(semester),
              studentIdCode: String(studentId),
              institutionId: req.user.institutionId,
              userId: user.id
            }
          });
        });

        results.created++;
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`,
      data: results,
      tempPassword
    });
  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ success: false, message: 'Error importing students', error: error.message });
  }
};

// @desc    Bulk import teachers from Excel/CSV
// @route   POST /api/bulk-import/teachers
// @access  Institution Admin
export const bulkImportTeachers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel/CSV file' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    const results = { created: 0, errors: [], skipped: 0 };
    const tempPassword = 'TempPass@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const name = row['Full Name'] || row['Name'] || row['name'] || row['full_name'];
        const email = row['Email'] || row['email'];
        const phone = row['Phone'] || row['phone'] || '';
        const department = row['Department'] || row['department'] || '';
        const designation = row['Designation'] || row['designation'] || '';
        const employeeId = row['Employee ID'] || row['employee_id'] || row['EmployeeID'] || '';

        if (!name || !email) {
          results.errors.push({ row: rowNum, error: 'Missing required fields (Full Name, Email)' });
          continue;
        }

        const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
        if (existingTeacher) {
          results.skipped++;
          results.errors.push({ row: rowNum, error: `Teacher with email ${email} already exists` });
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const username = email.split('@')[0] + '_' + Date.now().toString(36);
          const user = await tx.user.create({
            data: {
              firstname: name.split(' ')[0],
              lastname: name.split(' ').slice(1).join(' ') || '',
              username,
              email,
              password: hashedPassword,
              phone: String(phone),
              department,
              designation,
              employeeIdCode: String(employeeId),
              role: 'teacher',
              institutionId: req.user.institutionId,
              isFirstLogin: true
            }
          });

          await tx.teacher.create({
            data: {
              name,
              email,
              phone: String(phone),
              department,
              designation,
              employeeIdCode: String(employeeId),
              institutionId: req.user.institutionId,
              userId: user.id
            }
          });
        });

        results.created++;
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`,
      data: results,
      tempPassword
    });
  } catch (error) {
    console.error('Error importing teachers:', error);
    res.status(500).json({ success: false, message: 'Error importing teachers', error: error.message });
  }
};

// @desc    Bulk import MCQ questions for a quiz from Excel/CSV
// @route   POST /api/bulk-import/mcqs/:quizId
// @access  Teacher, Institution Admin
export const bulkImportMCQs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel/CSV file' });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.quizId } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    const results = { created: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const questionText = row['Question'] || row['question'];
        const optionA = row['Option A'] || row['option_a'] || row['A'];
        const optionB = row['Option B'] || row['option_b'] || row['B'];
        const optionC = row['Option C'] || row['option_c'] || row['C'];
        const optionD = row['Option D'] || row['option_d'] || row['D'];
        const correctAnswer = String(row['Correct Answer'] || row['correct_answer'] || row['Answer'] || '').toUpperCase();
        const marks = parseInt(row['Marks'] || row['marks'] || '1', 10);
        const difficulty = (row['Difficulty'] || row['difficulty'] || 'medium').toLowerCase();

        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
          results.errors.push({ row: rowNum, error: 'Missing required fields' });
          continue;
        }

        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          results.errors.push({ row: rowNum, error: `Invalid correct answer: "${correctAnswer}". Must be A, B, C, or D` });
          continue;
        }

        await prisma.question.create({
          data: {
            quizId: quiz.id,
            questionText: String(questionText),
            optionA: String(optionA),
            optionB: String(optionB),
            optionC: String(optionC),
            optionD: String(optionD),
            correctAnswer,
            marks: isNaN(marks) ? 1 : marks,
            difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
          }
        });

        results.created++;
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    // Update quiz total marks
    const totalMarks = await prisma.question.aggregate({
      where: { quizId: quiz.id },
      _sum: { marks: true }
    });
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { totalMarks: totalMarks._sum.marks || 0 }
    });

    res.status(200).json({
      success: true,
      message: `MCQ import complete: ${results.created} questions created, ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    console.error('Error importing MCQs:', error);
    res.status(500).json({ success: false, message: 'Error importing MCQs', error: error.message });
  }
};

// @desc    Bulk enroll students in courses from Excel/CSV
// @route   POST /api/bulk-import/enrollments
// @access  Institution Admin
export const bulkEnroll = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel/CSV file' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const results = { enrolled: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        const courseCode = row['Course Code'] || row['course_code'];
        const userId = row['User ID'] || row['user_id'];
        const role = (row['Role'] || row['role'] || 'student').toLowerCase();

        if (!courseCode || !userId) {
          results.errors.push({ row: rowNum, error: 'Missing Course Code or User ID' });
          continue;
        }

        // Find course by code
        const course = await prisma.course.findFirst({
          where: { code: courseCode, institutionId: req.user.institutionId }
        });
        if (!course) {
          results.errors.push({ row: rowNum, error: `Course "${courseCode}" not found` });
          continue;
        }

        if (role === 'student') {
          const student = await prisma.student.findFirst({
            where: { studentIdCode: String(userId), institutionId: req.user.institutionId }
          });
          if (!student) {
            results.errors.push({ row: rowNum, error: `Student "${userId}" not found` });
            continue;
          }

          await prisma.student.update({
            where: { id: student.id },
            data: { enrolledCourses: { connect: { id: course.id } } }
          });
        } else if (role === 'teacher') {
          const teacher = await prisma.teacher.findFirst({
            where: { employeeIdCode: String(userId), institutionId: req.user.institutionId }
          });
          if (!teacher) {
            results.errors.push({ row: rowNum, error: `Teacher "${userId}" not found` });
            continue;
          }

          await prisma.course.update({
            where: { id: course.id },
            data: { teacherId: teacher.id }
          });
        }

        results.enrolled++;
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Enrollment complete: ${results.enrolled} processed, ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    console.error('Error bulk enrolling:', error);
    res.status(500).json({ success: false, message: 'Error bulk enrolling', error: error.message });
  }
};
