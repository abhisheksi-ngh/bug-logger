// const express = require('express');
//     const connectDB = require('./config/db');
//     const cors = require('cors');
//     require('dotenv').config();

//     const app = express();

//     // Connect to MongoDB
//     connectDB();

//     // Middleware
//     app.use(cors());
//     app.use(express.json());

//     // Routes
//     app.use('/api/users', require('routes/user'));
//     app.use('/api/projects', require('routes/project'));
//     app.use('/api/issues', require('routes/issue'));

//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/user'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/issues', require('./routes/issue'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));