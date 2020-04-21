import * as Boom from '@hapi/boom';
import * as Hapi from '@hapi/hapi';
import * as IHapi from 'hapi';
import * as Pino from 'pino';
import * as HapiBearer from 'hapi-auth-bearer-token';
import { constants } from 'http2';
// config
import * as IServer from './interfaces/App';
import { expectedEnvVarsBuilder } from './constants';
import { envVarsValidator } from './libs/helpers';
// database
import db from './database';
import { ConnectionOptions, Connection, Repository } from 'typeorm';
import UserData from './database/Entities/UserData';
// app
import { AuthStrategies } from './authStrategies/interfaces';
import authStaticStrategy from './authStrategies/static';
import composeRoutes from './routes';
import { Environments } from './interfaces/App';

class Server {
  private logger: Pino.Logger;

  private server: IHapi.Server;

  private config: IServer.ServerConfig;

  private db: Connection;

  public get log(): Pino.Logger {
    return this.logger;
  }

  public get params(): IServer.ServerConfig {
    return this.config;
  }

  public get usersDataRepository(): Repository<UserData> {
    return this.db.getRepository(UserData);
  }

  // Используется для тестов
  public get entityMetadatas() {
    return this.db.entityMetadatas.reduce(
      (acc, { name, tableName }) => ({ ...acc, [tableName]: this.db.getRepository(name) }),
      {},
    );
  }

  // eslint-disable-next-line class-methods-use-this
  public generateHttpError(error) {
    const { statusCode = constants.HTTP_STATUS_SERVICE_UNAVAILABLE, message = error.toString() } = error;
    return new Boom.Boom(message, { statusCode });
  }

  public async start(actualEnvVars: object): Promise<IHapi.Server> {
    try {
      process.on('unhandledRejection', err => {
        console.error(err);
        process.exit(1);
      });

      const processedEnvVars = envVarsValidator<IServer.ExpectedEnvVars>(expectedEnvVarsBuilder, actualEnvVars);
      this.config = processedEnvVars;

      this.initLogger();
      this.initServer();
      await this.addPlugins();

      this.server.auth.strategy(AuthStrategies.STATIC, 'bearer-access-token', {
        validate: authStaticStrategy(<string>this.config.staticToken),
      });

      this.initRoutes();
      await this.server.start();
      await this.initDB();

      this.log.info(`Server running at ${this.server.info.uri}`);
      return this.server;
    } catch (err) {
      const logger = this.log || console;
      if (this.server) {
        await this.server.stop();
      }
      logger.error(err);
      return err;
    }
  }

  public async stop() {
    if (this.db) {
      await this.db.close();
    }
    const logger = this.log || console;
    return this.server.stop().then(() => logger.warn('Server stopped'));
  }

  private initLogger() {
    const loggerConfigByEnvs: Map<IServer.Environments, Pino.LoggerOptions> = new Map([
      [IServer.Environments.LOCAL, { prettyPrint: { colorize: true }, level: 'debug' }],
      [IServer.Environments.TEST, { enabled: false }],
      [IServer.Environments.DEV, { timestamp: true }],
    ]);

    const environment = <IServer.Environments>this.params.environment;
    const defaultConfig = loggerConfigByEnvs.get(IServer.Environments.DEV);
    const loggerConfig = loggerConfigByEnvs.has(environment) ? loggerConfigByEnvs.get(environment) : defaultConfig;

    this.logger = Pino(loggerConfig);
  }

  private initServer() {
    this.server = new Hapi.Server({
      port: +this.params.serverPort,
      routes: {
        cors: {
          origin: ['*'],
        },
        validate: {
          failAction: async (request, h, err) => {
            if (err) {
              throw Boom.badRequest(err.message);
            }
          },
        },
      },
    });
  }

  private initRoutes() {
    this.server.realm.modifiers.route.prefix = <string>this.params.routePrefix;
    const baseUrl = this.params.apiVersion;
    const routes = composeRoutes(baseUrl);
    this.server.route(routes);
  }

  private addPlugins() {
    this.server.events.on('response', request => {
      const {
        info: { remoteAddress },
      } = request;
      const response = <IHapi.ResponseObject>request.response;
      this.log.info({
        request: {
          from: remoteAddress,
          to: `${request.method.toUpperCase()} ${request.path}`,
          headers: request.headers,
          body: request.payload,
        },
        response: {
          body: response.source,
          statusCode: response.statusCode,
        },
      });
    });

    return this.server.register([HapiBearer]);
  }

  private async initDB() {
    this.db = await db(
      <IServer.Environments>this.params.environment,
      <ConnectionOptions>{
        type: this.params.dbType,
        host: this.params.dbHost,
        port: +this.params.dbPort,
        username: this.params.dbUser,
        password: this.params.dbPassword,
        database: this.params.dbName,
      },
    );
  }
}

export default new Server();
