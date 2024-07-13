module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: [
      'react',
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': process.env.CI ? 'off' : 'warn',
      // add other rules here if needed
    },
  };
  