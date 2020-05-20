module.exports = {
  prettier: true,
  space: 2,
  rules: {
    // Io-ts types are mostly readonly, but not completely, adding boilerplate
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    // Typescript protects against the issues that this concerns
    'unicorn/no-fn-reference-in-iterator': 'off'
  }
};
