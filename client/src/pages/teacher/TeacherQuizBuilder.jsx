import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, ClipboardList, Eye, Upload, ArrowLeft, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const TeacherQuizBuilder = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', duration: '', totalMarks: 0, passingMarks: 0 });
  const [qForm, setQForm] = useState({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1, difficulty: 'medium' });

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  useEffect(() => { fetchQuizzes(); fetchCourses(); }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setQuizzes((await res.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setCourses((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${quizId}/questions`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setQuestions((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const createQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ ...form, duration: form.duration ? parseInt(form.duration) : null, totalMarks: parseInt(form.totalMarks), passingMarks: parseInt(form.passingMarks) })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowCreate(false);
      setForm({ title: '', description: '', courseId: '', duration: '', totalMarks: 0, passingMarks: 0 });
      fetchQuizzes();
    } catch (err) { alert(err.message); }
  };

  const togglePublish = async (quiz) => {
    try {
      await fetch(`${API_URL}/api/quizzes/${quiz.id}`, {
        method: 'PUT', headers: headers(),
        body: JSON.stringify({ isPublished: !quiz.isPublished })
      });
      fetchQuizzes();
    } catch (err) { alert(err.message); }
  };

  const deleteQuiz = async (id) => {
    if (!confirm('Delete this quiz and all its questions?')) return;
    await fetch(`${API_URL}/api/quizzes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchQuizzes();
    if (editingQuiz?.id === id) setEditingQuiz(null);
  };

  const openQuiz = (quiz) => {
    setEditingQuiz(quiz);
    fetchQuestions(quiz.id);
  };

  const addQuestion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${editingQuiz.id}/questions`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ ...qForm, marks: parseInt(qForm.marks) })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowQuestionForm(false);
      setQForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1, difficulty: 'medium' });
      fetchQuestions(editingQuiz.id);
      fetchQuizzes();
    } catch (err) { alert(err.message); }
  };

  const deleteQuestion = async (qId) => {
    if (!confirm('Delete this question?')) return;
    await fetch(`${API_URL}/api/quizzes/${editingQuiz.id}/questions/${qId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchQuestions(editingQuiz.id);
    fetchQuizzes();
  };

  if (loading) return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  // Question editor view
  if (editingQuiz) return (
    <DashboardLayout role="teacher">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditingQuiz(null)} className="p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-surface-900">{editingQuiz.title}</h1>
          <p className="text-sm text-surface-500">{questions.length} questions • {editingQuiz.totalMarks} marks</p>
        </div>
        <button onClick={() => setShowQuestionForm(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-sm font-bold shrink-0">{idx + 1}</span>
                <div>
                  <p className="text-sm font-medium text-surface-800">{q.questionText}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-surface-100 text-surface-600">{q.difficulty}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent-100 text-accent-700">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-300 hover:text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 ml-11">
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${q.correctAnswer === opt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-50 text-surface-600'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${q.correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-surface-200 text-surface-500'}`}>{opt}</span>
                  {q[`option${opt}`]}
                </div>
              ))}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="bg-white rounded-2xl border border-surface-200/60 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">No questions yet. Click "Add Question" to start building.</p>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowQuestionForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-800 mb-4">Add Question</h3>
            <div className="space-y-3">
              <textarea value={qForm.questionText} onChange={e => setQForm(p => ({ ...p, questionText: e.target.value }))} placeholder="Question text" rows={3}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none" />
              {['A', 'B', 'C', 'D'].map(opt => (
                <input key={opt} type="text" value={qForm[`option${opt}`]} onChange={e => setQForm(p => ({ ...p, [`option${opt}`]: e.target.value }))} placeholder={`Option ${opt}`}
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
              ))}
              <div className="grid grid-cols-3 gap-3">
                <select value={qForm.correctAnswer} onChange={e => setQForm(p => ({ ...p, correctAnswer: e.target.value }))}
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                  {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="number" value={qForm.marks} onChange={e => setQForm(p => ({ ...p, marks: e.target.value }))} placeholder="Marks" min="1"
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <select value={qForm.difficulty} onChange={e => setQForm(p => ({ ...p, difficulty: e.target.value }))}
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowQuestionForm(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={addQuestion} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium">Add Question</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );

  // Quiz list view
  return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quiz Builder</h1>
          <p className="text-sm text-surface-500 mt-1">Create and manage quizzes for your courses</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium shadow-lg shadow-brand-600/20">
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      <div className="space-y-3">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg transition-all animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${quiz.isPublished ? 'bg-emerald-100' : 'bg-accent-100'}`}>
                  <ClipboardList className={`w-6 h-6 ${quiz.isPublished ? 'text-emerald-600' : 'text-accent-600'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-surface-800 truncate">{quiz.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{quiz._count?.questions || 0} questions • {quiz.totalMarks} marks • {quiz.duration ? `${quiz.duration} min` : 'Untimed'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${quiz.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-600'}`}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </span>
                <button onClick={() => openQuiz(quiz)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600 transition-colors" title="Edit questions">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => togglePublish(quiz)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-emerald-600 transition-colors" title={quiz.isPublished ? 'Unpublish' : 'Publish'}>
                  {quiz.isPublished ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => navigate(`/teacher/results/${quiz.id}`)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-accent-600 transition-colors" title="View results">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => deleteQuiz(quiz.id)} className="p-2 rounded-lg hover:bg-red-50 text-surface-300 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="bg-white rounded-2xl border border-surface-200/60 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">No quizzes yet. Click "New Quiz" to create one.</p>
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-800 mb-4">Create New Quiz</h3>
            <div className="space-y-3">
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Quiz title"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" rows={2}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none" />
              <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Duration (min)"
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))} placeholder="Total marks"
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                <input type="number" value={form.passingMarks} onChange={e => setForm(p => ({ ...p, passingMarks: e.target.value }))} placeholder="Pass marks"
                  className="px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={createQuiz} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium">Create Quiz</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherQuizBuilder;
