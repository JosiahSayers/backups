import * as dotenv from 'dotenv';

export class Environment {
  private static requiredVariables = [
    'SHRTLNK_DB_URL',
    'REDIS_HOST',
    'REDIS_PORT',
  ];

  static async loadEnv() {
    if (!Environment.isProduction) {
      dotenv.config();
    }
    const missingVariables = this.requiredVariables.filter(
      (envVar) => !process.env[envVar]
    );
    if (missingVariables.length) {
      console.log(
        `Missing environment variables: ${missingVariables.join(', ')}`
      );
      process.exit(1);
    }
    this.validateVariables();
  }

  private static validateVariables() {
    try {
      new URL(Environment.shrtlnkDatabaseUrl);
    } catch (e) {
      console.error(e);
      console.error('SHRTLNK_DB_URL must be a valid URI');
      process.exit(1);
    }
  }

  static get port() {
    return parseInt(process.env.PORT || '3000');
  }

  static get redisConnection() {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
    };
  }

  static get shrtlnkDatabaseUrl() {
    return process.env.SHRTLNK_DB_URL!;
  }

  static get backupFolder() {
    return this.isProduction ? '/backups' : 'tmp/backups';
  }

  static get isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  static get backupRotationLimit() {
    return process.env.ROTATION_LIMIT
      ? parseInt(process.env.ROTATION_LIMIT)
      : null;
  }
}

Environment.loadEnv();
