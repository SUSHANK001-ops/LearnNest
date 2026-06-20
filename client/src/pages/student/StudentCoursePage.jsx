import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Video, ArrowLeft, Download, Play, Youtube } from 'lucide-react';
import ReactPlayer from 'react-player';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { API_URL } from '../../config';

const StudentCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => { fetchCourse(); }, [id]);
  useEffect(() => { fetchContent(); }, [id, currentFolder]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setCourse((await res.json()).data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchContent = async () => {
    const headers = { 'Authorization': `Bearer ${getToken()}` };
    const folderParam = currentFolder ? `&folderId=${currentFolder}` : '';
    const parentParam = currentFolder ? `&parentId=${currentFolder}` : '';
    try {
      const [fRes, fiRes, vRes] = await Promise.all([
        fetch(`${API_URL}/api/folders?courseId=${id}${parentParam}`, { headers }),
        fetch(`${API_URL}/api/files?courseId=${id}${folderParam}`, { headers }),
        fetch(`${API_URL}/api/videos?courseId=${id}${folderParam}`, { headers }),
      ]);
      if (fRes.ok) setFolders((await fRes.json()).data || []);
      if (fiRes.ok) setFiles((await fiRes.json()).data || []);
      if (vRes.ok) setVideos((await vRes.json()).data || []);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <DashboardLayout role="student">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/student/dashboard')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{course?.title || 'Course'}</h1>
          <p className="text-sm text-slate-500">{course?.teacher?.name ? `By ${course.teacher.name}` : ''}</p>
        </div>
      </div>

      {/* Video Player */}
      {activeVideo && (
        <div className="mb-6 bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video">
            {activeVideo.type === 'youtube' ? (
              <ReactPlayer url={activeVideo.youtubeUrl || activeVideo.storageUrl} width="100%" height="100%" controls />
            ) : (
              <video src={activeVideo.storageUrl} controls className="w-full h-full" />
            )}
          </div>
          <div className="p-4 bg-slate-900">
            <h3 className="text-white font-semibold">{activeVideo.title}</h3>
            <button onClick={() => setActiveVideo(null)} className="text-xs text-slate-400 hover:text-white mt-1">Close player</button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => setCurrentFolder(null)} className="text-indigo-600 hover:text-indigo-700 font-medium">Root</button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">Current Folder</span>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Folders */}
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setCurrentFolder(folder.id)}
            className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
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
          <div key={file.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-medium text-slate-800 text-sm truncate">{file.originalName}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <a href={file.storageUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        ))}

        {/* Videos */}
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${video.type === 'youtube' ? 'bg-red-100' : 'bg-purple-100'}`}>
              {video.type === 'youtube' ? <Youtube className="w-6 h-6 text-red-600" /> : <Play className="w-6 h-6 text-purple-600" />}
            </div>
            <p className="font-medium text-slate-800 text-sm truncate">{video.title}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{video.type} • Click to play</p>
          </button>
        ))}
      </div>

      {folders.length === 0 && files.length === 0 && videos.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No content available yet.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCoursePage;
