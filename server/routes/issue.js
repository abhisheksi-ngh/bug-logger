// File: server/routes/issue.js
const express = require('express');
const router = express.Router();
const { createIssue, getIssues, updateIssue, deleteIssue } = require('../controllers/issueController');
const auth = require('../middleware/auth');

router.post('/', auth, createIssue);
router.get('/project/:projectId', auth, getIssues);
router.put('/:id', auth, updateIssue);
router.delete('/:id', auth, deleteIssue);

module.exports = router;