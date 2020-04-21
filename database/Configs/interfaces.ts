import { ConnectionOptions } from 'typeorm';
import { Environments } from '../../interfaces/App';

export type ConfigsByEnvironment = Map<Environments, ConnectionOptions>;

export type ConfiguratorDB<R = ConnectionOptions> = (environment: Environments, config: ConnectionOptions) => R;
