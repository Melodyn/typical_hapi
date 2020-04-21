import { Controller } from './interfaces';
import server from '../../server';
import { BadRequestError } from '../../interfaces/App';

const controller: Controller = async ({ id, userId, data }) => {
  if (!id) {
    throw new BadRequestError('id является обязательным аргументом');
  }
  return server.usersDataRepository
    .findOne({ where: { id, userId } })
    .then(result => {
      if (!result) {
        throw new BadRequestError(`Отсутствует запись с id=${id} для пользователя ${userId}`);
      }
    })
    .then(() => server.usersDataRepository.save({ id, data }));
};

export default controller;
