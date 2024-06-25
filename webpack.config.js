const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Base config that applies to either development or production mode.
const config = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: './build',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/pyscript', to: 'pyscript' },
        { from: 'src/style.css', to: 'style.css' },
        { from: 'src/pyscript.toml', to: 'pyscript.toml' },
        { from: 'src/worker.js', to: 'worker.js' },
        { from: 'src/worker.py', to: 'worker.py' },
        { from: 'node_modules/blockly/media', to: 'media'}
      ],
    }),
  ],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.output.path = path.resolve(__dirname, 'build');
    config.devtool = 'eval-cheap-module-source-map';
    config.module.rules.push({
      test: /(blockly\/.*\.js)$/,
      use: [require.resolve('source-map-loader')],
      enforce: 'pre',
    });
    config.ignoreWarnings = [/Failed to parse source map/];
  }
  return config;
};
