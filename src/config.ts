const entities =
  process.env.NODE_ENV === 'local'
    ? ['src/domain/entity/index.ts']
    : ['dist/src/domain/entity/index.ts'];

export default () => ({
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 4000,
  jwt: {
    issuer: process.env.JWT_ISSUER,
    pubkey: process.env.JWT_PUBLIC_KEY,
    secret: process.env.JWT_SECRET,
  },
  auth: {
    enable: process.env.AUTH_ENABLE,
  },
  tracing: process.env.TRACING,
  debug: process.env.DEBUG,
  db: {
    name: 'default',
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: 'sample_dev9',
    uuidExtension: 'pgcrypto',
    entities,
    logging: process.env.DB_LOGGING,
    synchronize: process.env.SYNCHRONIZE,
    migrations: ['../database/migration/*/**'],
  },
});
