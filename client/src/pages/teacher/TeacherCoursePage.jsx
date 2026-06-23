import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Video, Upload, Plus, ArrowLeft, Trash2, Youtube } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const TeacherCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', type: 'youtube', youtubeUrl: '' });
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  const getToken = () => localStorage.getItem('token');
  const headers = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  useEffect(() => { fetchCourse(); fetchFolders(); fetchFiles(); fetchVideos(); }, [id, currentFolder]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setCourse((await res.json()).data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchFolders = async () => {
    const url = currentFolder ? `${API_URL}/api/folders?courseId=${id}&parentId=${currentFolder}` : `${API_URL}/api/folders?courseId=${id}`;
    try {
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setFolders((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const fetchFiles = async () => {
    const params = currentFolder ? `courseId=${id}&folderId=${currentFolder}` : `courseId=${id}`;
    try {
      const res = await fetch(`${API_URL}/api/files?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setFiles((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const fetchVideos = async () => {
    const params = currentFolder ? `courseId=${id}&folderId=${currentFolder}` : `courseId=${id}`;
    try {
      const res = await fetch(`${API_URL}/api/videos?${params}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setVideos((await res.json()).data || []);
    } catch (err) { console.error(err); }
  };

  const initFolders = async () => {
    try {
      await fetch(`${API_URL}/api/folders/init/${id}`, { method: 'POST', headers: headers() });
      fetchFolders();
    } catch (err) { alert(err.message); }
  };

  const createFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await fetch(`${API_URL}/api/folders`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ name: folderName, courseId: id, parentId: currentFolder || undefined })
      });
      setFolderName(''); setShowFolderModal(false); fetchFolders();
    } catch (err) { alert(err.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', id);
      if (currentFolder) formData.append('folderId', currentFolder);

      const res = await fetch(`${API_URL}/api/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      fetchFiles();
    } catch (err) { alert(err.message); }
    finally { setUploading(false); }
  };

  const addVideo = async () => {
    try {
      const body = { ...videoForm, courseId: id };
      if (currentFolder) body.folderId = currentFolder;

      const res = await fetch(`${API_URL}/api/videos`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(body)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowVideoModal(false); setVideoForm({ title: '', type: 'youtube', youtubeUrl: '' }); fetchVideos();
    } catch (err) { alert(err.message); }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    await fetch(`${API_URL}/api/files/${fileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchFiles();
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    await fetch(`${API_URL}/api/videos/${videoId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getToken()}` } });
    fetchVideos();
  };

  if (loading) return (
    <DashboardLayout role="teacher">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/teacher/dashboard')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{course?.title || 'Course'}</h1>
          <p className="text-sm text-slate-500">{course?.description}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => setCurrentFolder(null)} className="text-brand-600 hover:text-brand-700 font-medium">Root</button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Subfolder</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {folders.length === 0 && !currentFolder && (
          <button onClick={initFolders} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors text-sm font-medium">
            <FolderOpen className="w-4 h-4" /> Initialize Folders
          </button>
        )}
        <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> New Folder
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium cursor-pointer">
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload File'}
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
        <button onClick={() => setShowVideoModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
          <Youtube className="w-4 h-4" /> Add Video
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Folders */}
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
              <FolderOpen className="w-6 h-6 text-amber-600" />
            </div>
            <p className="font-semibold text-slate-800 truncate">{folder.name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {folder._count?.files || 0} files • {folder._count?.videos || 0} videos
            </p>
          </button>
        ))}

        {/* Files */}
        {files.map(file => (
          <div key={file.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <button onClick={() => deleteFile(file.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="font-medium text-slate-800 text-sm truncate">{file.originalName}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <a href={file.storageUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium">Download →</a>
          </div>
        ))}

        {/* Videos */}
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${video.type === 'youtube' ? 'bg-red-100' : 'bg-accent-100'}`}>
                {video.type === 'youtube' ? <Youtube className="w-6 h-6 text-red-600" /> : <Video className="w-6 h-6 text-accent-600" />}
              </div>
              <button onClick={() => deleteVideo(video.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="font-medium text-slate-800 text-sm truncate">{video.title}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{video.type}</p>
          </div>
        ))}
      </div>

      {folders.length === 0 && files.length === 0 && videos.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center mt-4">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No content yet. Initialize default folders or upload files.</p>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFolderModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">New Folder</h3>
            <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder name"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-indigo-400" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowFolderModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={createFolder} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Video</h3>
            <div className="space-y-3">
              <input type="text" value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} placeholder="Video title"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-indigo-400" />
              <input type="url" value={videoForm.youtubeUrl} onChange={e => setVideoForm(p => ({ ...p, youtubeUrl: e.target.value }))} placeholder="YouTube URL"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-indigo-400" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowVideoModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={addVideo} className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">Add Video</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherCoursePage;
