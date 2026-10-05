// Issue and Assignment Routes for CampusFix
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateCreateIssue,
  validateAssignTechnician,
  validateResolveIssue,
  validateReopenIssue,
  validateAddComment,
} = require('../validators/issueValidators');

// Issue Core Routes
router.get('/', authenticate, issueController.getIssues);
router.post('/', authenticate, validateCreateIssue, issueController.createIssue);
router.get('/:id', authenticate, issueController.getIssueById);
router.patch('/:id', authenticate, issueController.updateIssue);

// Workflow Action Routes
router.post('/:id/comments', authenticate, validateAddComment, issueController.addComment);
router.post('/:id/reopen', authenticate, validateReopenIssue, issueController.reopenIssue);
router.post('/:id/cancel', authenticate, issueController.cancelIssue);
router.post('/:id/close', authenticate, issueController.closeIssue);

// Assignment & Technician Workflow Routes
router.post('/:id/assign', authenticate, authorize('ADMIN'), validateAssignTechnician, assignmentController.assignTechnician);
router.post('/:id/accept', authenticate, assignmentController.acceptAndStartWork);
router.post('/:id/start', authenticate, assignmentController.acceptAndStartWork);
router.post('/:id/resolve', authenticate, validateResolveIssue, assignmentController.resolveIssue);

module.exports = router;
