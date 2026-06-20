import { prisma } from '../config/db.js';

// ==================== QUIZ CRUD ====================

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Teacher
export const createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, duration, totalMarks, passingMarks, startDate, endDate } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: 'Title and course ID are required' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || '',
        courseId,
        createdById: req.user.id,
        duration: duration || null,
        totalMarks: totalMarks || 0,
        passingMarks: passingMarks || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        course: { select: { title: true } },
        _count: { select: { questions: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Quiz created successfully', data: quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Error creating quiz', error: error.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes?courseId=xxx
// @access  Teacher, Student
export const getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;

    // Students only see published quizzes
    if (req.user.role === 'student') {
      where.isPublished = true;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        course: { select: { title: true } },
        createdBy: { select: { firstname: true, lastname: true } },
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Error fetching quizzes', error: error.message });
  }
};

// @desc    Get single quiz with questions (teacher view)
// @route   GET /api/quizzes/:id
// @access  Teacher, Institution Admin
export const getQuizById = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        course: { select: { id: true, title: true } },
        createdBy: { select: { firstname: true, lastname: true } },
        questions: { orderBy: { createdAt: 'asc' } },
        _count: { select: { attempts: true } }
      }
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Error fetching quiz', error: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Teacher
export const updateQuiz = async (req, res) => {
  try {
    const { title, description, duration, totalMarks, passingMarks, isPublished, startDate, endDate } = req.body;

    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const updatedQuiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: updateData,
      include: { _count: { select: { questions: true } } }
    });

    res.status(200).json({ success: true, message: 'Quiz updated successfully', data: updatedQuiz });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Error updating quiz', error: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Teacher
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await prisma.quiz.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Error deleting quiz', error: error.message });
  }
};

// ==================== QUESTION CRUD ====================

// @desc    Add question to quiz
// @route   POST /api/quizzes/:id/questions
// @access  Teacher
export const addQuestion = async (req, res) => {
  try {
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks, difficulty } = req.body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Correct answer must be A, B, C, or D' });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const question = await prisma.question.create({
      data: {
        quizId: req.params.id,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: correctAnswer.toUpperCase(),
        marks: marks || 1,
        difficulty: difficulty || 'medium'
      }
    });

    // Update total marks on quiz
    const totalMarks = await prisma.question.aggregate({
      where: { quizId: req.params.id },
      _sum: { marks: true }
    });

    await prisma.quiz.update({
      where: { id: req.params.id },
      data: { totalMarks: totalMarks._sum.marks || 0 }
    });

    res.status(201).json({ success: true, message: 'Question added', data: question });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: 'Error adding question', error: error.message });
  }
};

// @desc    Update question
// @route   PUT /api/quizzes/questions/:questionId
// @access  Teacher
export const updateQuestion = async (req, res) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.questionId } });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const updateData = {};
    const fields = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'marks', 'difficulty'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'correctAnswer' ? req.body[field].toUpperCase() : req.body[field];
      }
    });

    const updated = await prisma.question.update({
      where: { id: req.params.questionId },
      data: updateData
    });

    // Update total marks on quiz
    const totalMarks = await prisma.question.aggregate({
      where: { quizId: question.quizId },
      _sum: { marks: true }
    });
    await prisma.quiz.update({
      where: { id: question.quizId },
      data: { totalMarks: totalMarks._sum.marks || 0 }
    });

    res.status(200).json({ success: true, message: 'Question updated', data: updated });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, message: 'Error updating question', error: error.message });
  }
};

// @desc    Delete question
// @route   DELETE /api/quizzes/questions/:questionId
// @access  Teacher
export const deleteQuestion = async (req, res) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.questionId } });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await prisma.question.delete({ where: { id: req.params.questionId } });

    // Update total marks on quiz
    const totalMarks = await prisma.question.aggregate({
      where: { quizId: question.quizId },
      _sum: { marks: true }
    });
    await prisma.quiz.update({
      where: { id: question.quizId },
      data: { totalMarks: totalMarks._sum.marks || 0 }
    });

    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: 'Error deleting question', error: error.message });
  }
};

// ==================== QUIZ ATTEMPT (Student) ====================

// @desc    Start a quiz attempt
// @route   POST /api/quizzes/:id/start
// @access  Student
export const startQuizAttempt = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: { select: { id: true, questionText: true, optionA: true, optionB: true, optionC: true, optionD: true, marks: true } } }
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({ success: false, message: 'Quiz is not published yet' });
    }

    // Get student profile
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Check if student already has an in-progress attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId: req.params.id, studentId: student.id, status: 'in_progress' }
    });

    if (existingAttempt) {
      // Return existing attempt with questions
      return res.status(200).json({
        success: true,
        message: 'Resuming existing attempt',
        data: { attempt: existingAttempt, questions: quiz.questions }
      });
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: req.params.id,
        studentId: student.id,
        totalMarks: quiz.totalMarks
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz started',
      data: { attempt, questions: quiz.questions }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ success: false, message: 'Error starting quiz', error: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/attempts/:attemptId/submit
// @access  Student
export const submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedAnswer }]

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: req.params.attemptId },
      include: { quiz: { include: { questions: true } } }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.status === 'submitted') {
      return res.status(400).json({ success: false, message: 'Quiz already submitted' });
    }

    // Process answers
    let score = 0;
    const answerRecords = [];

    for (const answer of (answers || [])) {
      const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedAnswer?.toUpperCase() === question.correctAnswer;
      if (isCorrect) score += question.marks;

      answerRecords.push({
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer?.toUpperCase() || null,
        isCorrect
      });
    }

    // Save all answers and update attempt
    await prisma.$transaction([
      ...answerRecords.map(a => prisma.quizAnswer.create({ data: a })),
      prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: { score, status: 'submitted', submittedAt: new Date() }
      })
    ]);

    const updatedAttempt = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: { answers: { include: { question: true } } }
    });

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.totalMarks > 0 ? Math.round((score / attempt.totalMarks) * 100) : 0,
        passed: score >= attempt.quiz.passingMarks,
        attempt: updatedAttempt
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Error submitting quiz', error: error.message });
  }
};

// @desc    Get student's quiz attempts
// @route   GET /api/quizzes/:id/attempts
// @access  Student
export const getMyAttempts = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: req.params.id, studentId: student.id },
      include: {
        quiz: { select: { title: true, totalMarks: true, passingMarks: true } },
        answers: { include: { question: true } }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, message: 'Error fetching attempts', error: error.message });
  }
};

// @desc    Get all attempts for a quiz (teacher view)
// @route   GET /api/quizzes/:id/all-attempts
// @access  Teacher
export const getAllAttempts = async (req, res) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: req.params.id },
      include: {
        student: { select: { name: true, email: true, studentIdCode: true } },
        quiz: { select: { title: true, totalMarks: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    console.error('Error fetching all attempts:', error);
    res.status(500).json({ success: false, message: 'Error fetching attempts', error: error.message });
  }
};
