module.exports = {
  prettier: true,
  space: 2,
  rules: {
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/prefer-module': 'off',
    // Typescript protects against the issues that this concerns
    'unicorn/no-fn-reference-in-iterator': 'off',
  },
}
