const db = require('../config/database');
const logger = require('../utils/logger');
const RedisService = require('./redis.service');
const createHttpError = require('http-errors');

class NoteService {
  async createNote(userId, noteData) {
    try {
      const note = await db.Note.create({
        title: noteData.title,
        content: noteData.content,
        userId
      });

      // Create initial version
      await db.NoteVersion.create({
        noteId: note.id,
        title: note.title,
        content: note.content,
        version: note.version,
        userId
      });

      return note;
    } catch (err) {
      logger.error(`Create note error: ${err.message}`);
      throw createHttpError(500, 'Failed to create note');
    }
  }

  async getNotes(userId) {
    try {
      const cacheKey = `user:${userId}:notes`;
      const cachedNotes = await RedisService.getCache(cacheKey);

      if (cachedNotes) {
        return JSON.parse(cachedNotes);
      }

      const notes = await db.Note.findAll({
        where: { userId, deletedAt: null },
        order: [['updatedAt', 'DESC']]
      });

      await RedisService.setCache(cacheKey, JSON.stringify(notes));
      return notes;
    } catch (err) {
      logger.error(`Get notes error: ${err.message}`);
      throw createHttpError(500, 'Failed to get notes');
    }
  }

  async getNoteById(userId, noteId) {
    try {
      const cacheKey = `note:${noteId}`;
      const cachedNote = await RedisService.getCache(cacheKey);

      if (cachedNote) {
        return JSON.parse(cachedNote);
      }

      const note = await db.Note.findOne({
        where: { id: noteId },
        include: [
          {
            model: db.SharedNote,
            as: 'sharedWith',  // Use the alias defined in the association
            include: [
              {
                model: db.User,  // Include the User model to get details about the shared users
                as: 'user',
              },
            ],
          },
          {
            model: db.NoteVersion,
            as: 'versions',  // If you want to include versions
          },
        ],
      });

      if (!note) {
        throw createHttpError(404, 'Note not found');
      }

      // Check if user owns the note or has shared access
      if (note.userId !== userId && (!note.SharedNotes || note.SharedNotes.length === 0)) {
        throw createHttpError(403, 'Unauthorized access');
      }

      await RedisService.setCache(cacheKey, JSON.stringify(note));
      return note;
    } catch (err) {
      logger.error(`Get note by ID error: ${err.message}`);
      throw err;
    }
  }

  async searchNotes(userId, query) {
    try {
      const notes = await db.Note.findAll({
        where: {
          userId,
          deletedAt: null,
          [db.Sequelize.Op.or]: [
            { title: { [db.Sequelize.Op.like]: `%${query}%` } },
            { content: { [db.Sequelize.Op.like]: `%${query}%` } }
          ]
        },
        order: [['updatedAt', 'DESC']]
      });

      return notes;
    } catch (err) {
      logger.error(`Search notes error: ${err.message}`);
      throw createHttpError(500, 'Failed to search notes');
    }
  }

  async updateNote(userId, noteId, noteData, currentVersion) {
    const transaction = await db.sequelize.transaction();
    try {
      const note = await db.Note.findOne({
        where: { id: noteId, deletedAt: null },
        transaction
      });

      if (!note) {
        throw createHttpError(404, 'Note not found');
      }

      if (note.userId !== userId) {
        throw createHttpError(403, 'Unauthorized to update this note');
      }

      // Optimistic concurrency control
      if (note.version !== currentVersion) {
        throw createHttpError(409, 'Note has been modified by another user');
      }

      // Update note
      note.title = noteData.title || note.title;
      note.content = noteData.content || note.content;
      note.version += 1;
      await note.save({ transaction });

      // Create new version
      await db.NoteVersion.create({
        noteId: note.id,
        title: note.title,
        content: note.content,
        version: note.version,
        userId
      }, { transaction });

      await transaction.commit();

      // Invalidate cache
      await RedisService.delCache(`note:${noteId}`);
      await RedisService.delCache(`user:${userId}:notes`);

      return note;
    } catch (err) {
      await transaction.rollback();
      logger.error(`Update note error: ${err.message}`);
      throw err;
    }
  }

  async deleteNote(userId, noteId) {
    const transaction = await db.sequelize.transaction();
    try {
      const note = await db.Note.findOne({
        where: { id: noteId, deletedAt: null },
        transaction
      });

      if (!note) {
        throw createHttpError(404, 'Note not found');
      }

      if (note.userId !== userId) {
        throw createHttpError(403, 'Unauthorized to delete this note');
      }

      note.deletedAt = new Date();
      await note.save({ transaction });

      await transaction.commit();

      // Invalidate cache
      await RedisService.delCache(`note:${noteId}`);
      await RedisService.delCache(`user:${userId}:notes`);

      return note;
    } catch (err) {
      await transaction.rollback();
      logger.error(`Delete note error: ${err.message}`);
      throw err;
    }
  }

  async shareNote(userId, noteId, shareData) {
    const transaction = await db.sequelize.transaction();
    try {
      const note = await db.Note.findOne({
        where: { id: noteId, deletedAt: null },
        transaction
      });

      if (!note) {
        throw createHttpError(404, 'Note not found');
      }

      if (note.userId !== userId) {
        throw createHttpError(403, 'Unauthorized to share this note');
      }

      if (shareData.userId === userId) {
        throw createHttpError(400, 'Cannot share note with yourself');
      }

      const sharedNote = await db.SharedNote.create({
        noteId,
        userId: shareData.userId,
        permission: shareData.permission || 'read'
      }, { transaction });

      await transaction.commit();

      // Invalidate cache for the recipient
      await RedisService.delCache(`user:${shareData.userId}:notes`);

      return sharedNote;
    } catch (err) {
      await transaction.rollback();
      logger.error(`Share note error: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new NoteService();