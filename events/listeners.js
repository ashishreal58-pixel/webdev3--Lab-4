const appEmitter = require('./emitter');

/**
 * Register listeners for application domain events.
 */
function registerEventListeners() {
  appEmitter.on('user:signup', ({ email, role }) => {
    console.log(`[EVENT] user:signup -> ${email} (role: ${role})`);
  });

  appEmitter.on('user:login', ({ email }) => {
    console.log(`[EVENT] user:login -> ${email}`);
  });

  appEmitter.on('note:created', ({ noteId, userId }) => {
    console.log(`[EVENT] note:created -> noteId=${noteId} by userId=${userId}`);
  });

  appEmitter.on('note:deleted', ({ noteId, userId }) => {
    console.log(`[EVENT] note:deleted -> noteId=${noteId} by userId=${userId}`);
  });
}

module.exports = registerEventListeners;
