// import { useState, useEffect } from 'react';
//    import axios from 'axios';
//    import { useNavigate } from 'react-router-dom';

//    function Dashboard({ user }) {
//      const [projects, setProjects] = useState([]);
//      const [issues, setIssues] = useState([]);
//      const [newProject, setNewProject] = useState({ name: '', description: '' });
//      const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'low', project: '' });
//      const navigate = useNavigate();

//      useEffect(() => {
//        if (!user) navigate('/login');
//        fetchProjects();
//      }, [user]);

//      const fetchProjects = async () => {
//        try {
//          const res = await axios.get('http://localhost:5000/api/projects');
//          setProjects(res.data);
//        } catch (error) {
//          console.error(error.response.data);
//        }
//      };

//      const fetchIssues = async (projectId) => {
//        try {
//          const res = await axios.get(`http://localhost:5000/api/issues/project/${projectId}`);
//          setIssues(res.data);
//        } catch (error) {
//          console.error(error.response.data);
//        }
//      };

//      const handleCreateProject = async (e) => {
//        e.preventDefault();
//        try {
//          await axios.post('http://localhost:5000/api/projects', newProject);
//          fetchProjects();
//          setNewProject({ name: '', description: '' });
//        } catch (error) {
//          console.error(error.response.data);
//        }
//      };

//      const handleCreateIssue = async (e) => {
//        e.preventDefault();
//        try {
//          await axios.post('http://localhost:5000/api/issues', newIssue);
//          fetchIssues(newIssue.project);
//          setNewIssue({ title: '', description: '', priority: 'low', project: '' });
//        } catch (error) {
//          console.error(error.response.data);
//        }
//      };

//      return (
//        <div className="container mx-auto p-4">
//          <h1 className="text-3xl font-bold mb-6">Bug Logger Dashboard</h1>
//          <div className="mb-8">
//            <h2 className="text-2xl font-bold mb-4">Create Project</h2>
//            <form onSubmit={handleCreateProject} className="mb-4">
//              <input
//                type="text"
//                placeholder="Project Name"
//                value={newProject.name}
//                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
//                className="p-2 border rounded mr-2"
//              />
//              <input
//                type="text"
//                placeholder="Description"
//                value={newProject.description}
//                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
//                className="p-2 border rounded mr-2"
//              />
//              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//                Create Project
//              </button>
//            </form>
//          </div>
//          <h2 className="text-2xl font-bold mb-4">Projects</h2>
//          <ul className="mb-8">
//            {projects.map((project) => (
//              <li key={project._id} className="mb-2">
//                <button
//                  onClick={() => fetchIssues(project._id)}
//                  className="text-blue-500 underline"
//                >
//                  {project.name}
//                </button>
//              </li>
//            ))}
//          </ul>
//          <div>
//            <h2 className="text-2xl font-bold mb-4">Create Issue</h2>
//            <form onSubmit={handleCreateIssue} className="mb-4">
//              <input
//                type="text"
//                placeholder="Issue Title"
//                value={newIssue.title}
//                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
//                className="p-2 border rounded mr-2"
//              />
//              <input
//                type="text"
//                placeholder="Description"
//                value={newIssue.description}
//                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
//                className="p-2 border rounded mr-2"
//              />
//              <select
//                value={newIssue.priority}
//                onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
//                className="p-2 border rounded mr-2"
//              >
//                <option value="low">Low</option>
//                <option value="medium">Medium</option>
//                <option value="high">High</option>
//              </select>
//              <select
//                value={newIssue.project}
//                onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
//                className="p-2 border rounded mr-2"
//              >
//                <option value="">Select Project</option>
//                {projects.map((project) => (
//                  <option key={project._id} value={project._id}>
//                    {project.name}
//                  </option>
//                ))}
//              </select>
//              <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//                Create Issue
//              </button>
//            </form>
//          </div>
//          <h2 className="text-2xl font-bold mb-4">Issues</h2>
//          <ul>
//            {issues.map((issue) => (
//              <li key={issue._id} className="mb-2">
//                {issue.title} - {issue.priority} - {issue.status}
//              </li>
//            ))}
//          </ul>
//        </div>
//      );
//    }

//    export default Dashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'low', project: '', status: 'open' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Set axios default headers with token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch projects on mount if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/projects');
      setProjects(res.data.data); // Backend returns { status, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch projects';
      setError(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (projectId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/issues/project/${projectId}`);
      setIssues(res.data.data); // Backend returns { status, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch issues';
      setError(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    if (!newProject.name || !newProject.description) {
      setError('Project name and description are required');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/projects', newProject);
      await fetchProjects();
      setNewProject({ name: '', description: '' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      setError(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setError('');
    if (!newIssue.title || !newIssue.description || !newIssue.project) {
      setError('Title, description, and project are required');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/issues', newIssue);
      await fetchIssues(newIssue.project);
      setNewIssue({ title: '', description: '', priority: 'low', project: '', status: 'open' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create issue';
      setError(message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bug Logger Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Project</h2>
        <form onSubmit={handleCreateProject} className="mb-4 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="p-2 border rounded flex-1"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="p-2 border rounded flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            Create Project
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      {projects.length === 0 && !loading && <p>No projects found.</p>}
      <ul className="mb-8">
        {projects.map((project) => (
          <li key={project._id} className="mb-2">
            <button
              onClick={() => fetchIssues(project._id)}
              className="text-blue-500 underline hover:text-blue-700"
              disabled={loading}
            >
              {project.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Issue</h2>
        <form onSubmit={handleCreateIssue} className="mb-4 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Issue Title"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            className="p-2 border rounded flex-1"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Description"
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            className="p-2 border rounded flex-1"
            disabled={loading}
          />
          <select
            value={newIssue.priority}
            onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
            className="p-2 border rounded"
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={newIssue.project}
            onChange={(e) => setNewIssue({ ...newIssue, project: e.target.value })}
            className="p-2 border rounded"
            disabled={loading}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            Create Issue
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Issues</h2>
      {issues.length === 0 && !loading && <p>No issues found.</p>}
      <ul>
        {issues.map((issue) => (
          <li key={issue._id} className="mb-2">
            {issue.title} - Priority: {issue.priority} - Status: {issue.status || 'Open'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
