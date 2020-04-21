import { AuthParam, Controller as RouteController, Data, UserData } from '../../interfaces/App';

export type CreationParams = {
  data: Data;
} & AuthParam;

export type Response = UserData;

export type Controller = RouteController<CreationParams, Response>;
