module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
  }
};
