import * as Server from '../interfaces/App';

export const expectedEnvVarsBuilder: Server.ExpectedEnvVars = Object.entries(Server.EnvVars).reduce<
  Server.ExpectedEnvVars
>(
  (acc, [key, value]) => ({
    ...acc,
    [value]: key,
  }),
  {} as Server.ExpectedEnvVars,
);
