import { Controller } from './interfaces';
import server from '../../server';
import { BadRequestError } from '../../interfaces/App';

const controller: Controller = async ({ id, userId }) => {
  if (!id) {
    throw new BadRequestError('id является обязательным аргументом');
  }
  return server.usersDataRepository.delete({ id, userId }).then(data => {
    if (data.affected === 0) {
      throw new BadRequestError(`Отсутствует запись с id=${id} для пользователя ${userId}`);
    }
    return id;
  });
};

export default controller;
