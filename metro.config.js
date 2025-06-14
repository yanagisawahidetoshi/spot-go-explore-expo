const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// pnpmのシンボリックリンクの問題を解決
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// watchFoldersを設定
config.watchFolders = [
  path.resolve(__dirname),
];

module.exports = config;