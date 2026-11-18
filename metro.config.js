const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Permite importar las migraciones .sql de src/db/migrations.
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
