import * as path from 'path';
import { ConnectionOptions } from 'typeorm';
import { Environments } from '../../interfaces/App';
import * as I from './interfaces';

const configsByEnvironments: I.ConfigsByEnvironment = new Map([
  [
    Environments.TEST,
    <ConnectionOptions>{
      synchronize: true,
      logging: false,
      entities: [path.resolve(__dirname, '..', 'Entities', '{*.ts,*.js}')],
    },
  ],
  [
    Environments.LOCAL,
    <ConnectionOptions>{
      synchronize: true,
      logging: ['query', 'error', 'migration'],
      entities: [path.resolve(__dirname, '..', 'Entities', '{*.ts,*.js}')],
    },
  ],
  [
    Environments.DEV,
    <ConnectionOptions>{
      synchronize: true,
      logging: ['migration'],
      entities: [path.resolve(__dirname, '..', 'Entities', '{*.ts,*.js}')],
    },
  ],
]);

const getConfig: I.ConfiguratorDB = (environment, currentConfig) => {
  const environmentConfig = configsByEnvironments.has(environment)
    ? configsByEnvironments.get(environment)
    : configsByEnvironments.get(Environments.DEV);

  return <ConnectionOptions>{
    ...currentConfig,
    ...environmentConfig,
  };
};

export default getConfig;
