import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const StudentQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { startQuiz(); }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const startQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAttempt(data.data.attempt);
      setQuestions(data.data.questions || []);

      // Set timer if quiz has duration
      if (data.data.attempt?.quiz?.duration) {
        setTimeLeft(data.data.attempt.quiz.duration * 60);
      }
    } catch (err) { alert(err.message); navigate('/student/dashboard'); }
    finally { setLoading(false); }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId, selectedAnswer
      }));

      const res = await fetch(`${API_URL}/api/quizzes/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setResult(data.data);
      setSubmitted(true);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  // Result Screen
  if (submitted && result) return (
    <DashboardLayout role="student">
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center shadow-lg">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {result.passed ? <CheckCircle2 className="w-10 h-10 text-emerald-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {result.passed ? 'Congratulations! 🎉' : 'Better luck next time'}
          </h2>
          <p className="text-slate-500 mb-6">{result.passed ? 'You passed the quiz!' : 'Keep practicing and try again'}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-900">{result.score}</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-900">{result.totalMarks}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className={`text-2xl font-bold ${result.percentage >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>{result.percentage}%</p>
              <p className="text-xs text-slate-500">Percentage</p>
            </div>
          </div>

          <button onClick={() => navigate('/student/dashboard')} className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium">
            Back to Dashboard
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/student/dashboard')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Quiz</h1>
            <p className="text-sm text-slate-500">{questions.length} questions</p>
          </div>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>{Object.keys(answers).length} of {questions.length} answered</span>
          <span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-sm font-bold shrink-0">{idx + 1}</span>
              <p className="text-sm font-medium text-slate-800 pt-1">{q.questionText}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-11">
              {['A', 'B', 'C', 'D'].map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-all ${
                    answers[q.id] === opt
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    answers[q.id] === opt ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}>{opt}</span>
                  <span>{q[`option${opt}`]}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 pl-11 mt-2">{q.marks} mark{q.marks > 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{Object.keys(answers).length}/{questions.length} answered</p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium disabled:opacity-50 shadow-lg shadow-brand-500/20"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizPage;
