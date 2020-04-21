import app from '../server';

// содержимое файла /deployment/test.env
const testEnvString: string = process.env.NODE_ENV_TEST || '';

const validEnvVars = testEnvString
  .trim()
  .split('\n')
  .reduce((acc, row) => {
    const [key, value] = row.split('=');
    return { ...acc, [key]: value };
  }, {});
const invalidEnvVars = Object.entries(validEnvVars).reduce((acc, [key, value]) => {
  const createInvalid = (currentKey, currentValue) => {
    switch (currentKey) {
      case 'DB_NAME':
        return [null, null];
      case 'DB_PASSWORD':
        return [null, null];
      case 'STATIC_TOKEN':
        return [currentKey, ''];
      default:
        return [currentKey, currentValue];
    }
  };
  const [updatedKey, updatedValue] = createInvalid(key, value);
  return updatedKey ? { ...acc, [updatedKey]: updatedValue } : acc;
}, {});

test('Positive cases', async () => {
  const server = await app.start(validEnvVars);
  expect(server).not.toBeNull();
  expect(app).toHaveProperty('log');
  expect(app).toHaveProperty('params');
  expect(app).toHaveProperty('stop');
  await app.stop();
});

test('Negative cases', async () => {
  await expect(app.start(invalidEnvVars)).resolves.toThrow(
    'Environment variables parsing error. Missing keys: ["DB_NAME","DB_PASSWORD"]. Empty values: ["STATIC_TOKEN"].',
  );
});
