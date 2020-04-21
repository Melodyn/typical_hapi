import { AuthParam, Controller as RouteController, UserData } from '../../interfaces/App';

export interface QueryParams {
  id: number;
}

export type ReadParams = QueryParams & AuthParam;

export interface Response {
  data: UserData[];
}

export type Controller = RouteController<ReadParams, Response>;
