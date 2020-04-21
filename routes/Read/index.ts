import { Controller } from './interfaces';
import server from '../../server';

const controller: Controller = async ({ id, userId }) => {
  const idWhere = id && { id };

  // TODO когда-нибудь удалить этот тест stacktrace для kibana
  if (userId === 'd69bfbdd-ffbb-4225-8851-7155bcb3684f') {
    throw new Error('Jopa lala');
  }
  if (userId === 'd69bfbdd-ffbb-4225-8851-7155bcb3685f') {
    // @ts-ignore
    return server.userDataRepository.find({ where: { ...idWhere, userId } });
  }
  // END

  return server.usersDataRepository.find({ where: { ...idWhere, userId } }).then(data => ({ data }));
};

export default controller;
