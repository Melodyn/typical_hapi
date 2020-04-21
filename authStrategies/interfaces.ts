import * as IHapi from 'hapi';

export interface AuthObject<Crds = object, B = boolean> {
  isValid: B;
  credentials: Crds;
}

export type AuthStrategy<Rtrn = AuthObject, Auth = string, Req = IHapi.Request, Res = IHapi.ResponseToolkit> = (
  request: Req,
  currentAuthData: Auth,
  h: Res,
) => Rtrn;

export enum AuthStrategies {
  STATIC = 'static',
}
