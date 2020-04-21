import { Request } from 'hapi';
import { constants } from 'http2';

export enum EnvVars {
  NODE_ENV = 'environment',
  API_VERSION = 'apiVersion',
  SERVER_PORT = 'serverPort',
  ROUTE_PREFIX = 'routePrefix',
  STATIC_TOKEN = 'staticToken',
  DB_TYPE = 'dbType',
  DB_HOST = 'dbHost',
  DB_PORT = 'dbPort',
  DB_NAME = 'dbName',
  DB_USER = 'dbUser',
  DB_PASSWORD = 'dbPassword',
}

export enum Environments {
  // developer machine
  TEST = 'test',
  LOCAL = 'local',
  // server
  DEV = 'dev',
}

type EnvVarName = keyof typeof EnvVars;
type ServiceConfigValue = string;

export type ExpectedEnvVars<ValueType = EnvVarName> = {
  [key in EnvVars]: ValueType;
};

export type ServerConfig = ExpectedEnvVars<ServiceConfigValue>;

export type IDecoratedRequest<P = {}, Q = {}, C = {}, H = {}> = {
  payload: P;
  query: Q;
  auth: { credentials: C };
  headers: H;
} & Request;

export interface AuthParam {
  userId: string;
}

export type Controller<Params, Response> = (params: Params) => Promise<Response>;

export interface ISystemError {
  statusCode: number;
  message: string;
}

export class SystemError extends Error {
  readonly statusCode: number;

  readonly message: string;

  constructor(params: ISystemError) {
    super(params.message);
    this.message = params.message;
    this.statusCode = params.statusCode;
  }
}

export class BadRequestError extends SystemError {
  constructor(message: string) {
    super({ message, statusCode: constants.HTTP_STATUS_BAD_REQUEST });
  }
}

export type Data = any;
export type UserData = {
  id: number;
  data: Data;
};
