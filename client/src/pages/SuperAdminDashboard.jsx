import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionTable from '../components/InstitutionTable';
import AddInstitutionModal from '../components/AddInstitutionModal';
import { API_URL } from '../config';

const SuperAdminDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(data.message || 'Failed to fetch institutions');
      }

      setInstitutions(data.data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstitution = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/institutions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create institution');
      }

      await fetchInstitutions();
      setIsModalOpen(false);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleEditInstitution = async (id, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/institutions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update institution');
      }

      await fetchInstitutions();
    } catch (err) {
      setError(err.message);
      console.error('Error updating institution:', err);
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm('Are you sure you want to delete this institution?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/institutions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete institution');
      }

      await fetchInstitutions();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting institution:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LearnNest Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all institutions</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Institutions</h2>
            <p className="text-sm text-gray-600 mt-1">
              {institutions.length} institution{institutions.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/superadmin/manage-admins')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Manage Admins
            </button>
            <button
              onClick={() => navigate('/superadmin/create-admin')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create Admin
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Institution
            </button>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-white rounded-lg shadow">
          <InstitutionTable
            institutions={institutions}
            onEdit={handleEditInstitution}
            onDelete={handleDeleteInstitution}
            loading={loading}
          />
        </div>
      </div>

      {/* Add Institution Modal */}
      <AddInstitutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInstitution}
      />
    </div>
  );
};

export default SuperAdminDashboard;
