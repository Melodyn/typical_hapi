import * as IHapi from 'hapi';
import { AuthStrategy } from './interfaces';

export default (staticToken: string): AuthStrategy => (request: IHapi.Request, userToken: string) => ({
  isValid: userToken === staticToken,
  credentials: {},
});
