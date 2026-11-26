const express = require('express');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All notes routes require a valid JWT
router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
