import { Connection, createConnection } from 'typeorm';
import getConfig from './Configs';
import { ConfiguratorDB } from './Configs/interfaces';
import 'reflect-metadata';

const db: ConfiguratorDB<Promise<Connection>> = (environment, config) => {
  const dbConfig = getConfig(environment, config);
  return createConnection(dbConfig);
};

export default db;
