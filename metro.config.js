const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Permite importar las migraciones .sql de src/db/migrations.
config.resolver.sourceExts.push('sql');

module.exports = config;
