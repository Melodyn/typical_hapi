import { EntitySchema, Repository } from 'typeorm';

import server from '../../server';
import Create from '../../routes/Create';
import Read from '../../routes/Read';
import Update from '../../routes/Update';
import Delete from '../../routes/Delete';

const fixtures = {
  validUser1: {
    userId: '2314332e-798d-424b-b452-3f818174623b',
    content: {
      stringData: {
        id: 1,
        data: 'string value',
      },
      objectData: {
        id: 3,
        data: {
          key: 'value',
        },
      },
    },
  },
  validUser2: {
    userId: '977f6910-7a14-4a60-ad88-150f0b6405f0',
    content: {
      numberData: {
        id: 2,
        data: 123456789,
      },
      arrayData: {
        id: 4,
        data: [123, '456', 7.89],
      },
    },
  },
  invalidUser: {
    userId: '052f5efd-d476-4887-9a48-46c9cf5e316f',
    content: {
      invalidData: {
        id: 5,
        data: [],
      },
    },
  },
};

// содержимое файла /deployment/test.env
const testEnvString: string = process.env.NODE_ENV_TEST || '';
const testEnvVars = testEnvString
  .trim()
  .split('\n')
  .reduce((acc, row) => {
    const [key, value] = row.split('=');
    return { ...acc, [key]: value };
  }, {});

beforeAll(async () => {
  await server.start(testEnvVars);
});

afterAll(async () => {
  await Promise.all(
    Object.entries(server.entityMetadatas).map(([tableName, repo]: [string, Repository<EntitySchema>]) =>
      repo.query(`TRUNCATE TABLE ${tableName};
      ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`),
    ),
  );
  await server.stop();
});

describe('Positive cases', () => {
  test('Create', async () => {
    const { validUser1: user1, validUser2: user2 } = fixtures;
    await expect(Create({ userId: user1.userId, data: user1.content.stringData.data })).resolves.toMatchObject(
      user1.content.stringData,
    );
    await expect(Create({ userId: user2.userId, data: user2.content.numberData.data })).resolves.toMatchObject(
      user2.content.numberData,
    );
    await expect(Create({ userId: user1.userId, data: user1.content.objectData.data })).resolves.toMatchObject(
      user1.content.objectData,
    );
    await expect(Create({ userId: user2.userId, data: user2.content.arrayData.data })).resolves.toMatchObject(
      user2.content.arrayData,
    );
  });

  test('Read. Запрос всех данных по userId существующего пользователя', async () => {
    const { validUser1: user1 } = fixtures;
    const { objectData, stringData } = user1.content;
    const expectedResponse = {
      data: [objectData, stringData],
    };
    const response = await Read({ id: 0, userId: user1.userId });
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveLength(expectedResponse.data.length);
    expectedResponse.data.forEach(currentResponse => {
      const { data } = response.data.find(responseData => responseData.id === currentResponse.id);
      expect(data).toEqual(currentResponse.data);
    });
  });

  test('Read. Запрос данных по id существующего пользователя', async () => {
    const { validUser1 } = fixtures;
    const validResponse = await Read({ id: 1, userId: validUser1.userId });
    expect(validResponse).toHaveProperty('data');
    expect(validResponse.data).toHaveLength(1);
    expect(validResponse.data[0]).toMatchObject(validUser1.content.stringData);

    const emptyResponse = await Read({ id: 2, userId: validUser1.userId });
    expect(emptyResponse).toHaveProperty('data');
    expect(emptyResponse.data).toHaveLength(0);
  });

  test('Read. Запрос всех данных по userId несуществующего пользователя', async () => {
    const { invalidUser } = fixtures;
    const response = await Read({ id: 0, userId: invalidUser.userId });
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveLength(invalidUser.content.invalidData.data.length);
  });

  test('Update. Обновление данных существующего пользователя', async () => {
    const {
      validUser1: { userId, content },
    } = fixtures;
    const updatedData = content.stringData.data.repeat(2);
    const response = await Update({ id: content.stringData.id, userId, data: updatedData });
    expect(response).toMatchObject({
      id: content.stringData.id,
      data: updatedData,
    });
  });

  test('Delete. Удаление данных существующего пользователя', async () => {
    const {
      validUser1: { userId, content },
    } = fixtures;
    const response = await Delete({ id: content.stringData.id, userId });
    expect(response).toEqual(content.stringData.id);

    const validResponse = await Read({ id: 0, userId });
    expect(validResponse).toHaveProperty('data');
    expect(validResponse.data).toHaveLength(1);
    expect(validResponse.data[0]).toMatchObject(content.objectData);
  });
});

describe('Negative cases', () => {
  test('Read. Чтение данных другого пользователя', async () => {
    const { validUser1, validUser2 } = fixtures;
    const { id } = validUser2.content.arrayData;
    const { userId } = validUser1;
    const response = await Read({ id, userId });
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveLength(0);
  });

  test('Update. Обновление данных другого пользователя', async () => {
    const { validUser1, validUser2 } = fixtures;
    const { id } = validUser2.content.arrayData;
    const { userId } = validUser1;

    await expect(Update({ id, userId, data: 'Аллах бабах!' })).rejects.toThrow(
      `Отсутствует запись с id=${id} для пользователя ${userId}`,
    );
  });

  test('Delete. Удаление данных другого пользователя', async () => {
    const { validUser1, validUser2 } = fixtures;
    const { id } = validUser2.content.arrayData;
    const { userId } = validUser1;

    await expect(Delete({ id, userId })).rejects.toThrow(`Отсутствует запись с id=${id} для пользователя ${userId}`);
  });
});
