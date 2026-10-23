module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Las migraciones de drizzle-kit son archivos .sql que se empaquetan como texto.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
