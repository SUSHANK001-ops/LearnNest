import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import InstitutionTable from '../components/InstitutionTable';
import AddInstitutionModal from '../components/AddInstitutionModal';
import { API_URL } from '../config';

const SuperAdminDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchInstitutions(); }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const response = await fetch(`${API_URL}/api/institutions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
        throw new Error(data.message || 'Failed to fetch institutions');
      }
      setInstitutions(data.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleCreateInstitution = async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/institutions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create institution');
    await fetchInstitutions();
    setIsModalOpen(false);
  };

  const handleEditInstitution = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/institutions/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update');
      await fetchInstitutions();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm('Delete this institution?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/institutions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete');
      await fetchInstitutions();
    } catch (err) { setError(err.message); }
  };

  return (
    <DashboardLayout role="superadmin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Platform Overview</h1>
        <p className="text-sm text-surface-500 mt-1">Manage all institutions on LearnNest</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Institutions</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{institutions.length}</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-brand-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-500">Admins</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{institutions.reduce((a, i) => a + (i._count?.users || 0), 0)}</p>
            </div>
            <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200/60 p-5 flex items-center justify-center">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors">
            <Plus className="w-5 h-5" /> Add New Institution
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Institutions Table */}
      <div className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden">
        <InstitutionTable
          institutions={institutions}
          onEdit={handleEditInstitution}
          onDelete={handleDeleteInstitution}
          loading={loading}
        />
      </div>

      <AddInstitutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInstitution}
      />
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
