const { getDefaultConfig, mergeConfig } = require('metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return mergeConfig(defaultConfig, {
    watchFolders: [monorepoRoot],
    resolver: {
      nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(monorepoRoot, 'node_modules'),
      ],
      extraNodeModules: {
        'react': path.resolve(projectRoot, 'node_modules/react'),
        'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
      },
      blockList: [
        /.*\/apps\/web\/.next\/.*/,
        /.*\\apps\\web\\.next\\.*/,
      ],
    },
  });
})();
