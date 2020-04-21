import { Controller } from './interfaces';
import server from '../../server';
import { BadRequestError } from '../../interfaces/App';

const controller: Controller = async ({ userId, data }) => {
  if (!data) {
    throw new BadRequestError('Отсутствуют данные для записи');
  }
  return server.usersDataRepository.save({ userId, data });
};

export default controller;
