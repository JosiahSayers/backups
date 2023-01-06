import path from 'node:path';
import { exec } from 'node:child_process';
import { stat, readdir, rm } from 'node:fs/promises';
import { filesize } from 'filesize';
import { Environment } from '../utils/environment';
import { mkdir } from 'node:fs/promises';

const backupFolder = 'shrtlnk';
const backupTitle = () => `${new Date().toISOString()}.sql`;

export async function shrtlnkBackup() {
  await createFolder();
  const backupFilepath = path.join(
    Environment.backupFolder,
    backupFolder,
    backupTitle()
  );
  return new Promise((res, rej) => {
    exec(
      `pg_dump ${Environment.shrtlnkDatabaseUrl} -f ${backupFilepath}`,
      async (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          rej(err);
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(stdout);
          console.log(stderr);
        }
        const { size } = await stat(backupFilepath);
        const rotationResults = await rotateBackups();
        res({
          size: filesize(size),
          file: path.join(backupFolder, backupTitle()),
          backupRotateEnabled: rotationResults !== null,
          deletedBackups: rotationResults?.backupsDeleted.length ?? undefined,
          failedToDeleteBackups: rotationResults?.failedBackupDeletions.length
            ? rotationResults.failedBackupDeletions
            : undefined,
        });
      }
    );
  });
}

async function createFolder() {
  return mkdir(path.join(Environment.backupFolder, backupFolder), {
    recursive: true,
  });
}

async function rotateBackups() {
  if (Environment.backupRotationLimit === null) {
    return null;
  }

  const folder = path.join(Environment.backupFolder, backupFolder);
  const backups = await readdir(folder);

  if (backups.length <= Environment.backupRotationLimit) {
    return { backupsDeleted: [], failedBackupDeletions: [] };
  }

  const sortedBackups = backups.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const backupsToDelete = sortedBackups.slice(
    0,
    Environment.backupRotationLimit * -1
  );
  const backupDeletePromises = backupsToDelete.map(async (backup) => {
    try {
      const backupPath = path.join(folder, backup);
      await rm(backupPath);
      return backup;
    } catch (e) {
      console.error('Failed to delete backup file during rotation step', e);
      throw backup;
    }
  });
  const results = await Promise.allSettled(backupDeletePromises);

  return {
    backupsDeleted: results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.status),
    failedBackupDeletions: results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason),
  };
}
