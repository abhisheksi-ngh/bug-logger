import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side email validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users/register', { email, password, role });
      if (res && res.data && res.data.data.token) {
        localStorage.setItem('token', res.data.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.data.token;
        setUser({ email });
        navigate('/login');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error(error.response.data);
      setError(error.response?.data?.message || 'Server not responding');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Developer">Developer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;