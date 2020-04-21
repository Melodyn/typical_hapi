import * as IHapi from 'hapi';
import { getConnection } from 'typeorm';
import { constants } from 'http2';
import server from '../server';
import { SystemError } from '../interfaces/App';

const healthCheck: IHapi.ServerRoute[] = [
  {
    method: 'GET',
    path: 'kubernetes/liveness',
    handler: async () => {
      try {
        return await server.usersDataRepository
          .findOne({ id: 0 })
          .then(() => 'liveness ok')
          .catch(err => {
            server.log.error(err);
            throw new SystemError({
              statusCode: constants.HTTP_STATUS_SERVICE_UNAVAILABLE,
              message: `liveness failed, the database is not responding`,
            });
          });
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
  {
    method: 'GET',
    path: 'kubernetes/readiness',
    handler: async () => {
      try {
        const connection = getConnection();
        const successResponse = 'readiness ok';

        if (!connection.isConnected) {
          return await connection
            .connect()
            .then(() => successResponse)
            .catch(err => {
              server.log.error(err);
              throw new SystemError({
                statusCode: constants.HTTP_STATUS_SERVICE_UNAVAILABLE,
                message: `readiness failed lost connection with database`,
              });
            });
        }

        return successResponse;
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
];

export default healthCheck;
