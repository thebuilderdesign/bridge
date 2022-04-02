module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/airbnb', '@vue/prettier'],
  ignorePatterns: ['**/src/lib/*'],
  rules: {
    // edit rules cautiously
    'class-methods-use-this': 'off',
    'global-require': 'off',
    'import/extensions': ['error', 'always', { js: 'never', vue: 'never' }],
    'import/no-cycle': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-unused-vars': ['warn', { args: 'none' }],
    'vue/no-unused-components': 'warn',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  overrides: [
    {
      files: ['**/test/**/*.test.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
};
