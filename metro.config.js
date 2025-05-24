const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return {
    ...config,
    transformer: {
      ...config.transformer,
      getTransformOptions: async () => ({
        transformOptions: {
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      ...config.resolver,
      // Block pdfjs-dist Node.js and web files
      blockList: [
        /node_modules\/pdfjs-dist\/build\/pdf\.js$/,
        /node_modules\/pdfjs-dist\/web\/.*$/,
        /node_modules\/pdfjs-dist\/.*\/worker\.js$/,
      ],
      // Fallbacks for Node.js modules
      extraNodeModules: {
        fs: require.resolve("expo-file-system"),
        path: require.resolve("path-browserify"),
      },
    },
  };
})();
