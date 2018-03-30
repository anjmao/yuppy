import { spawn } from 'child_process';
import { SUCCESS_CODE } from '../model/constant';

export function runCommand(cmd: string) {
    if (!cmd) {
        throw new Error(`Command is required`);
    }
    return new Promise((resolve, reject) => {
        const child = spawnCommand(cmd, { stdio: 'inherit' });
        child.on('error', (error) => {
            reject(error);
        });

        child.on('exit', (code) => {
            child.kill();
            code === SUCCESS_CODE  ? resolve(code) : reject(code);
        });
    });
}

function spawnCommand(command: string, options: any) {
    var file, args;
    if (process.platform === 'win32') {
        file = 'cmd.exe';
        args = ['/s', '/c', '"' + command + '"'];
        options = Object.assign({}, options);
        options.windowsVerbatimArguments = true;
        options.detached = false;
    } else {
        file = '/bin/sh';
        args = ['-c', command];
    }
    return spawn(file, args, options);
}