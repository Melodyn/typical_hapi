import { AuthParam, Controller as RouteController, Data, UserData } from '../../interfaces/App';

export interface QueryParams {
  id: number;
}

export type UpdateParams = {
  data: Data;
} & QueryParams &
  AuthParam;

export type Response = UserData;

export type Controller = RouteController<UpdateParams, Response>;
