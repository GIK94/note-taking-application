const NoteService = require('../services/note.service');
const createHttpError = require('http-errors');

exports.createNote = async (req, res, next) => {
  try {
    const note = await NoteService.createNote(req.user.id, req.body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await NoteService.getNotes(req.user.id);
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await NoteService.getNoteById(req.user.id, req.params.id);
    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.searchNotes = async (req, res, next) => {
  try {
    if (!req.query.q) {
      throw createHttpError(400, 'Search query is required');
    }
    const notes = await NoteService.searchNotes(req.user.id, req.query.q);
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const currentVersion = req.headers['if-match'];
    if (!currentVersion) {
      throw createHttpError(428, 'If-Match header required');
    }
    
    const note = await NoteService.updateNote(
      req.user.id,
      req.params.id,
      req.body,
      parseInt(currentVersion)
    );
    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    await NoteService.deleteNote(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.shareNote = async (req, res, next) => {
  try {
    const sharedNote = await NoteService.shareNote(
      req.user.id,
      req.params.id,
      req.body
    );
    res.status(201).json(sharedNote);
  } catch (err) {
    next(err);
  }
};