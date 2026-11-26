const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

function notesCollection() {
  return getDB().collection('notes');
}

async function createNote({ owner, title, content }) {
  const now = new Date();
  const doc = {
    owner: new ObjectId(owner),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
  const result = await notesCollection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function findByOwner(owner) {
  return notesCollection()
    .find({ owner: new ObjectId(owner) })
    .sort({ createdAt: -1 })
    .toArray();
}

async function findById(id) {
  if (!ObjectId.isValid(id)) return null;
  return notesCollection().findOne({ _id: new ObjectId(id) });
}

async function updateById(id, { title, content }) {
  const updates = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  const result = await notesCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

async function deleteById(id) {
  const result = await notesCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = {
  createNote,
  findByOwner,
  findById,
  updateById,
  deleteById,
};
