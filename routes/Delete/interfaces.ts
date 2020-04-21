import { AuthParam, Controller as RouteController } from '../../interfaces/App';

export interface QueryParams {
  id: number;
}

export type DeleteParams = QueryParams & AuthParam;

export type Response = number;

export type Controller = RouteController<DeleteParams, Response>;
