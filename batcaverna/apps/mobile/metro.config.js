const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Force Metro to resolve React and React Native from the local node_modules
// to avoid version conflicts with the monorepo root (React 19 vs 18).
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-is': path.resolve(projectRoot, 'node_modules/react-is'),
};

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.blockList = [
  /.*\/apps\/web\/.next\/.*/,
  /.*\\apps\\web\\.next\\.*/,
];

module.exports = config;
