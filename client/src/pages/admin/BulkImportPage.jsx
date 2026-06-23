import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Users, GraduationCap, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const importTypes = [
  { id: 'students', label: 'Students', icon: GraduationCap, desc: 'Import students with ID, Name, Email, Phone, Department, Semester', endpoint: '/api/bulk-import/students' },
  { id: 'teachers', label: 'Teachers', icon: Users, desc: 'Import teachers with Employee ID, Name, Email, Phone, Department, Designation', endpoint: '/api/bulk-import/teachers' },
  { id: 'mcqs', label: 'MCQ Questions', icon: ClipboardList, desc: 'Import quiz questions with Question, Options A-D, Answer, Marks, Difficulty', endpoint: '/api/bulk-import/mcqs' },
];

const BulkImportPage = () => {
  const [activeType, setActiveType] = useState('students');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [quizId, setQuizId] = useState('');

  const getToken = () => localStorage.getItem('token');

  const handleUpload = async () => {
    if (!file) return;
    const type = importTypes.find(t => t.id === activeType);
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (activeType === 'mcqs' && quizId) formData.append('quizId', quizId);

      const res = await fetch(`${API_URL}${type.endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templates = {
      students: 'Student ID,Full Name,Email,Phone,Department,Semester\nST001,John Doe,john@example.com,1234567890,Computer Science,3',
      teachers: 'Employee ID,Full Name,Email,Phone,Department,Designation\nT001,Jane Smith,jane@example.com,0987654321,Mathematics,Professor',
      mcqs: 'Question,Option A,Option B,Option C,Option D,Correct Answer,Marks,Difficulty\nWhat is 2+2?,3,4,5,6,B,1,easy',
    };
    const blob = new Blob([templates[activeType]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout role="institution_admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Bulk Import</h1>
        <p className="text-sm text-surface-500 mt-1">Import students, teachers, or quiz questions from Excel/CSV files</p>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {importTypes.map(type => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => { setActiveType(type.id); setFile(null); setResult(null); }}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${isActive ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10' : 'border-surface-200/60 bg-white hover:border-surface-300 hover:shadow-md'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isActive ? 'bg-brand-100' : 'bg-surface-100'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-brand-600' : 'text-surface-500'}`} />
              </div>
              <p className={`font-semibold text-sm ${isActive ? 'text-brand-800' : 'text-surface-800'}`}>{type.label}</p>
              <p className="text-xs text-surface-500 mt-1">{type.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-surface-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-surface-800">Upload {importTypes.find(t => t.id === activeType)?.label}</h3>
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>

        {activeType === 'mcqs' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Quiz ID</label>
            <input type="text" value={quizId} onChange={e => setQuizId(e.target.value)} placeholder="Enter quiz ID to import questions into"
              className="w-full max-w-md px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
          </div>
        )}

        {/* Drop zone */}
        <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-surface-300 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
          <FileSpreadsheet className="w-12 h-12 text-surface-300 mb-4" />
          <p className="text-sm font-medium text-surface-600 mb-1">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-surface-400">CSV or Excel files (.csv, .xlsx, .xls)</p>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={e => { setFile(e.target.files[0]); setResult(null); }} className="hidden" />
        </label>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={handleUpload} disabled={!file || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20">
            <Upload className="w-4 h-4" /> {uploading ? 'Importing...' : 'Start Import'}
          </button>
          {file && (
            <button onClick={() => { setFile(null); setResult(null); }} className="text-sm text-surface-500 hover:text-surface-700 transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className={`mt-6 p-4 rounded-xl border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {result.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-medium ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>{result.message}</p>
                {result.created !== undefined && <p className="text-xs text-emerald-600 mt-1">{result.created} records imported successfully</p>}
                {result.errors?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-red-600">Row {err.row}: {err.message}</p>
                    ))}
                    {result.errors.length > 10 && <p className="text-xs text-red-500">...and {result.errors.length - 10} more errors</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BulkImportPage;
