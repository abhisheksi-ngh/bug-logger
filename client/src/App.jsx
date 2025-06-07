import { useState, useEffect } from 'react';
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import axios from 'axios';
   import Login from './components/Login';
   import Register from './components/Register';
   import Dashboard from './components/Dashboard';

   function App() {
     const [user, setUser] = useState(null);

     useEffect(() => {
       const token = localStorage.getItem('token');
       if (token) {
         axios.defaults.headers.common['x-auth-token'] = token;
         // Fetch user data if needed
       }
     }, []);

     return (
       <Router>
         <div className="min-h-screen bg-gray-100">
           <Routes>
           <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/register" element={<Register />} />
             <Route path="/login" element={<Login setUser={setUser} />} />
             
             
           </Routes>
         </div>
       </Router>
     );
   }

   export default App;