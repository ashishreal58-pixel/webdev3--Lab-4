const { ObjectId } = require('mongodb');
const noteModel = require('../models/noteModel');
const appEmitter = require('../events/emitter');

/**
 * Fetch a note by ID and verify it exists and belongs to the requesting user.
 */
async function findOwnedNoteOrFail(noteId, userId, res) {
  if (!ObjectId.isValid(noteId)) {
    res.status(400).json({ message: 'Invalid note ID format.' });
    return null;
  }

  const note = await noteModel.findById(noteId);
  if (!note) {
    res.status(404).json({ message: 'Note not found.' });
    return null;
  }

  if (note.owner.toString() !== userId) {
    res.status(403).json({ message: 'Forbidden. You do not own this note.' });
    return null;
  }

  return note;
}

/**
 * POST /api/notes
 */
async function createNote(req, res) {
  try {
    const { title, content } = req.body || {};
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof content !== 'string' ||
      !content.trim()
    ) {
      return res.status(400).json({ message: 'Both title and content are required.' });
    }

    const note = await noteModel.createNote({
      owner: req.user.id,
      title: title.trim(),
      content: content.trim(),
    });

    appEmitter.emit('note:created', {
      noteId: note._id.toString(),
      userId: req.user.id,
    });

    return res.status(201).json(note);
  } catch (err) {
    console.error('[NOTES] Create error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * GET /api/notes
 */
async function getNotes(req, res) {
  try {
    const notes = await noteModel.findByOwner(req.user.id);
    return res.status(200).json(notes);
  } catch (err) {
    console.error('[NOTES] List error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * GET /api/notes/:id
 */
async function getNoteById(req, res) {
  try {
    const note = await findOwnedNoteOrFail(req.params.id, req.user.id, res);
    if (!note) return;
    return res.status(200).json(note);
  } catch (err) {
    console.error('[NOTES] Get by ID error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * PUT /api/notes/:id
 */
async function updateNote(req, res) {
  try {
    const note = await findOwnedNoteOrFail(req.params.id, req.user.id, res);
    if (!note) return;

    const { title, content } = req.body || {};
    const hasTitle = typeof title === 'string' && title.trim().length > 0;
    const hasContent = typeof content === 'string' && content.trim().length > 0;

    if (!hasTitle && !hasContent) {
      return res.status(400).json({ message: 'Provide a non-empty title or content to update.' });
    }

    const updated = await noteModel.updateById(req.params.id, {
      title: hasTitle ? title.trim() : undefined,
      content: hasContent ? content.trim() : undefined,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('[NOTES] Update error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

/**
 * DELETE /api/notes/:id
 */
async function deleteNote(req, res) {
  try {
    const note = await findOwnedNoteOrFail(req.params.id, req.user.id, res);
    if (!note) return;

    await noteModel.deleteById(req.params.id);
    appEmitter.emit('note:deleted', {
      noteId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('[NOTES] Delete error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
