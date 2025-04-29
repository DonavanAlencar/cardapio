// backend/src/utils/logger.js
const createDebug = require('debug');

// Namespace padrão: você pode ter vários, ex: app:startup, app:db, app:auth
exports.startup = createDebug('app:startup');
exports.auth    = createDebug('app:auth');
exports.db      = createDebug('app:db');
exports.api     = createDebug('app:api');