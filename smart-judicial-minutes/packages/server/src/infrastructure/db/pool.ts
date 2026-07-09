import sql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

/**
 * Azure SQL connection pool. Supports both SQL authentication (user/password)
 * and Microsoft Entra managed-identity authentication for zero-secret
 * production deployments.
 */
let poolPromise: Promise<sql.ConnectionPool> | null = null;

async function buildConfig(): Promise<sql.config> {
  const base: sql.config = {
    server: env.SQL_SERVER,
    database: env.SQL_DATABASE,
    options: {
      encrypt: env.SQL_ENCRYPT,
      trustServerCertificate: false,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
  };

  if (env.SQL_USE_MANAGED_IDENTITY) {
    const credential = new DefaultAzureCredential();
    const accessToken = await credential.getToken('https://database.windows.net/.default');
    if (!accessToken) {
      throw new Error('Failed to acquire managed-identity token for Azure SQL');
    }
    return {
      ...base,
      authentication: {
        type: 'azure-active-directory-access-token',
        options: { token: accessToken.token },
      },
    };
  }

  if (!env.SQL_USER || !env.SQL_PASSWORD) {
    throw new Error('SQL_USER and SQL_PASSWORD are required when not using managed identity');
  }

  return { ...base, user: env.SQL_USER, password: env.SQL_PASSWORD };
}

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const config = await buildConfig();
      const pool = new sql.ConnectionPool(config);
      pool.on('error', (err: unknown) => logger.error({ err }, 'SQL pool error'));
      await pool.connect();
      logger.info('Connected to Azure SQL');
      return pool;
    })().catch((err) => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

export async function closePool(): Promise<void> {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
    logger.info('Closed Azure SQL pool');
  }
}

export { sql };
