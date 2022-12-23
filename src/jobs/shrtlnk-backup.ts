import path from 'node:path';
import { exec } from 'node:child_process';
import { stat } from 'node:fs/promises';
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
        res({
          size: filesize(size),
          file: path.join(backupFolder, backupTitle()),
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
