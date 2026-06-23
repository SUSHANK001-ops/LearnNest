import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CheckCircle2, XCircle, Clock, ClipboardList } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const StudentResultsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/my-attempts`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) setAttempts((await res.json()).data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalAttempts = attempts.length;
  const passedCount = attempts.filter(a => a.score >= (a.quiz?.passingMarks || 0)).length;
  const avgPercentage = totalAttempts > 0 ? Math.round(attempts.reduce((acc, a) => acc + (a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0), 0) / totalAttempts) : 0;

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">My Results</h1>
        <p className="text-sm text-surface-500 mt-1">Track your quiz performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Quizzes Taken</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{totalAttempts}</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-brand-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Passed</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{passedCount}/{totalAttempts}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Avg Score</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{avgPercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {attempts.map(attempt => {
          const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
          const passed = attempt.score >= (attempt.quiz?.passingMarks || 0);
          return (
            <div key={attempt.id} className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-md transition-all animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {passed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-red-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-800 truncate">{attempt.quiz?.title || 'Quiz'}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      Score: {attempt.score}/{attempt.totalMarks} • {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'In progress'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${pct >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>{pct}%</p>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Score bar */}
              <div className="mt-3 w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${pct >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {attempts.length === 0 && (
          <div className="bg-white rounded-2xl border border-surface-200/60 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">No quiz results yet. Take a quiz to see your results here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResultsPage;
