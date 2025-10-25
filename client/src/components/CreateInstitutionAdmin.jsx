import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function CreateInstitutionAdmin() {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/institutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setInstitutions(data.data);
    } catch (err) {
      console.error('Error fetching institutions:', err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be signed in as LearnNest Admin');

      if (!institutionId) {
        throw new Error('Please select an institution');
      }

      const body = {
        fullname: { firstname, lastname },
        username,
        email,
        password,
        role: 'institution_admin',
        institutionId,
      };

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      
      // Get institution details for the download
      const selectedInstitution = institutions.find(inst => inst._id === institutionId);
      
      // Automatically download credentials
      downloadCredentials({
        institution: selectedInstitution?.name || 'N/A',
        domain: selectedInstitution?.domain || 'N/A',
        institutionEmail: selectedInstitution?.email || 'N/A',
        adminFirstName: firstname,
        adminLastName: lastname,
        username,
        email,
        password, // Plain text password - only available at creation time
        createdAt: new Date().toISOString()
      });
      
      setSuccess('Institution Admin created successfully! Credentials downloaded.');
      
      // Clear form
      setFirstname('');
      setLastname('');
      setUsername('');
      setEmail('');
      setPassword('');
      setInstitutionId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCredentials = (adminData) => {
    // Create text content
    const content = `
═══════════════════════════════════════════════════════════
            INSTITUTION ADMIN CREDENTIALS
═══════════════════════════════════════════════════════════

INSTITUTION DETAILS:
------------------------------------------------------------
Institution Name    : ${adminData.institution}
Domain             : ${adminData.domain}
Institution Email  : ${adminData.institutionEmail}

ADMIN CREDENTIALS:
------------------------------------------------------------
Full Name          : ${adminData.adminFirstName} ${adminData.adminLastName}
Username           : ${adminData.username}
Email              : ${adminData.email}
Password           : ${adminData.password}

IMPORTANT NOTES:
------------------------------------------------------------
⚠️  This is the ONLY time you will see the plain password.
⚠️  Store this file securely and delete after sharing.
⚠️  Change password after first login for security.
⚠️  Do not share this file via unsecured channels.

LOGIN URL: http://localhost:5173/login

Created At: ${new Date(adminData.createdAt).toLocaleString()}

═══════════════════════════════════════════════════════════
              LearnNest LMS - Admin Credentials
═══════════════════════════════════════════════════════════
`.trim();

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `admin-${adminData.username}-${new Date().getTime()}.txt`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Institution Admin</h1>
              <p className="text-sm text-gray-600 mt-1">Add a new admin for an institution</p>
            </div>
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Institution Selection */}
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                Select Institution *
              </label>
              <select
                id="institution"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
              >
                <option value="">-- Select an Institution --</option>
                {institutions.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name} ({inst.domain})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the institution this admin will manage
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="firstname"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Sushank"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastname"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Lamichhane"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sushanklamichhane"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Admin...' : 'Create Institution Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
