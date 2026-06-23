import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, CheckCircle2, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const TeacherQuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchResults(); }, [quizId]);

  const fetchResults = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${getToken()}` };
      const [quizRes, attemptsRes] = await Promise.all([
        fetch(`${API_URL}/api/quizzes/${quizId}`, { headers }),
        fetch(`${API_URL}/api/quizzes/${quizId}/attempts`, { headers }),
      ]);
      if (quizRes.ok) setQuiz((await quizRes.json()).data);
      if (attemptsRes.ok) setAttempts((await attemptsRes.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0;
  const passCount = attempts.filter(a => a.score >= (quiz?.passingMarks || 0)).length;
  const passRate = attempts.length > 0 ? Math.round((passCount / attempts.length) * 100) : 0;

  if (loading) return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="teacher">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/teacher/quizzes')} className="p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-surface-900">{quiz?.title || 'Quiz'} — Results</h1>
          <p className="text-sm text-surface-500">{attempts.length} total attempt{attempts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Total Attempts</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{attempts.length}</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Average Score</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{avgScore}/{quiz?.totalMarks || 0}</p>
            </div>
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Pass Rate</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{passRate}%</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${passRate >= 50 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {passRate >= 50 ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100">
          <h3 className="font-semibold text-surface-800">Student Attempts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {attempts.map(attempt => {
                const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
                const passed = attempt.score >= (quiz?.passingMarks || 0);
                return (
                  <tr key={attempt.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-surface-800">{attempt.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-surface-500">{attempt.student?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-surface-800">{attempt.score}/{attempt.totalMarks}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-surface-600">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'In progress'}
                    </td>
                  </tr>
                );
              })}
              {attempts.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-surface-400">No attempts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherQuizResults;
