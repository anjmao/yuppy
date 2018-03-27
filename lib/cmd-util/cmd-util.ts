import { spawn } from 'child_process';

export function runCommand(command: string, cmd: string) {
    console.log('rea')
    if (!cmd) {
        return Promise.resolve(`skipping: command "${command}" is not defined`);
    }
    return new Promise((resolve, reject) => {
        const child = spawnCommand(cmd, { stdio: 'inherit' });
        child.on('error', (error) => {
            reject('command error: ' + error.toString())
        });

        child.on('exit', (code) => {
            child.kill();
            code === 0  ? resolve(code) : reject(code);
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