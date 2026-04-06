module.exports = function override(config, env) {
  // Añadir fallback para módulos de Node.js que no están en el navegador
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": false, // Ignorar stream (no se necesita en el navegador)
    // Si quieres un polyfill real, puedes usar: "stream": require.resolve("stream-browserify")
  };

  // Buscar y excluir papaparse de Babel (por si acaso)
  const rules = config.module.rules.find(rule => rule.oneOf !== undefined).oneOf;
  const babelLoader = rules.find(rule => 
    rule.loader && rule.loader.includes('babel-loader')
  );
  
  if (babelLoader) {
    if (!babelLoader.exclude) {
      babelLoader.exclude = [];
    }
    if (Array.isArray(babelLoader.exclude)) {
      babelLoader.exclude.push(/node_modules[\\/]papaparse/);
    } else {
      babelLoader.exclude = [babelLoader.exclude, /node_modules[\\/]papaparse/].filter(Boolean);
    }
  }
  
  return config;
};