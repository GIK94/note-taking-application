const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.authenticate);

router.post('/', noteController.createNote);
router.get('/', noteController.getNotes);
router.get('/search', noteController.searchNotes);
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.post('/:id/share', noteController.shareNote);

module.exports = router;