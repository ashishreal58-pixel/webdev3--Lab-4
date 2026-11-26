const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

function usersCollection() {
  return getDB().collection('users');
}

async function createUser({ username, email, passwordHash, role = 'user' }) {
  const doc = {
    username,
    email,
    passwordHash,
    role,
    createdAt: new Date(),
  };
  const result = await usersCollection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function findByEmail(email) {
  return usersCollection().findOne({ email });
}

async function findById(id) {
  if (!ObjectId.isValid(id)) return null;
  return usersCollection().findOne({ _id: new ObjectId(id) });
}

async function findAllWithoutPassword() {
  return usersCollection()
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findAllWithoutPassword,
};
