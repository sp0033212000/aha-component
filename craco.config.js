// eslint-disable-next-line import/no-extraneous-dependencies
const CracoAlias = require('craco-alias');

/** @type {import('@types/craco__craco/index.d.ts').CracoConfig} */
module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.extend.json',
      },
    },
  ],
  webpack: {
    configure(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
      return config;
    },
  },
};
