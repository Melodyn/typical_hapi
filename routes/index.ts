import * as IHapi from 'hapi';
import * as Joi from '@hapi/joi';
import { AuthStrategies } from '../authStrategies/interfaces';
import { IDecoratedRequest, AuthParam, Data, SystemError } from '../interfaces/App';
import server from '../server';
// routes
import healthCheck from './healthCheck';
import * as IRead from './Read/interfaces';
import * as IDelete from './Delete/interfaces';
import * as IUpdate from './Update/interfaces';
import Create from './Create';
import Read from './Read';
import Update from './Update';
import Delete from './Delete';

const crud: IHapi.ServerRoute[] = [
  {
    method: 'GET',
    path: 'data',
    options: {
      validate: {
        query: Joi.object({
          userId: Joi.string()
            .uuid({ version: 'uuidv4' })
            .required(),
          id: Joi.number()
            .greater(0)
            .default(0)
            .optional(),
        }).required(),
      },
      auth: {
        strategy: AuthStrategies.STATIC,
      },
    },
    handler: async (req: IDecoratedRequest<{}, IRead.QueryParams & AuthParam>) => {
      try {
        const {
          query: { id, userId },
        } = req;
        return await Read({ id, userId });
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
  {
    method: 'POST',
    path: 'data',
    options: {
      validate: {
        query: Joi.object({
          userId: Joi.string()
            .uuid({ version: 'uuidv4' })
            .required(),
        }).required(),
        payload: Joi.any().required(),
      },
      auth: {
        strategy: AuthStrategies.STATIC,
      },
    },
    handler: async (req: IDecoratedRequest<Data, AuthParam>) => {
      try {
        const {
          payload: data,
          query: { userId },
        } = req;
        return await Create({ userId, data });
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
  {
    method: 'PUT',
    path: 'data',
    options: {
      validate: {
        query: Joi.object({
          userId: Joi.string()
            .uuid({ version: 'uuidv4' })
            .required(),
          id: Joi.number()
            .greater(0)
            .default(0)
            .required(),
        }).required(),
      },
      auth: {
        strategy: AuthStrategies.STATIC,
      },
    },
    handler: async (req: IDecoratedRequest<Data, IUpdate.QueryParams & AuthParam>) => {
      try {
        const {
          query: { id, userId },
          payload: data,
        } = req;
        return await Update({ id, userId, data });
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
  {
    method: 'DELETE',
    path: 'data',
    options: {
      validate: {
        query: Joi.object({
          userId: Joi.string()
            .uuid({ version: 'uuidv4' })
            .required(),
          id: Joi.number()
            .greater(0)
            .default(0)
            .required(),
        }).required(),
      },
      auth: {
        strategy: AuthStrategies.STATIC,
      },
    },
    handler: async (req: IDecoratedRequest<{}, IDelete.QueryParams & AuthParam>) => {
      try {
        const {
          query: { id, userId },
        } = req;
        return await Delete({ id, userId });
      } catch (err) {
        if (!(err instanceof SystemError)) {
          server.log.error(err);
        }
        return server.generateHttpError(err);
      }
    },
  },
];

const composeRoutes = (basePath: string): IHapi.ServerRoute[] =>
  [...crud, ...healthCheck].map<IHapi.ServerRoute>(
    (route): IHapi.ServerRoute => {
      const fullPath = `${basePath}/${route.path}`;
      return {
        ...route,
        path: fullPath,
      };
    },
  );

export default composeRoutes;
