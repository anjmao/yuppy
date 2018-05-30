import * as path from 'path';
import * as fs from 'fs';
import * as program from 'commander';
import { startTask } from './task/start';
import { RunTaskOptions, runTask } from './task/run';
import { Config, ConfigSchema } from './model/config';
import { FAILURE_CODE } from './model/constant';
import { enableTrance } from './trace';

const DEFAULT_CONFIG_NAME = 'yuppy.config.js';

exports.run = function () {
    program.version('v0.3.0');

    program
        .command('start')
        .description('Select and run package script')
        .option('-c, --config [config]', 'Optional yuppy config file path')
        .option('-t --trace', 'Ouput tracing messages')
        .action((args) => {
            if (args.trace) {
                enableTrance()
            }
            const config = getYuppyConfig(args.config);
            startTask(config).then((code) => {
                process.stdin.pause();
                process.exit(code);
            }).catch((err) => {
                console.log(err);
                process.stdin.pause();
                process.exit(FAILURE_CODE);
            });
        });

    program
        .command('run <script>')
        .description('Run given script(s) for all project')
        .option('-c, --config [config]', 'Optional yuppy config file path')
        .option('-s, --stop-on-fail', 'Stop on first failed script (default true)')
        .option('-S, --skip-unchanged', 'Skip script when project is not changed (default false)')
        .option('-p, --parallel', 'Run in parallel (default false)')
        .option('-P, --max-parallel-scripts [maxParallelScripts]', 'Set max parallel scripts to run at the same time')
        .option('-t --trace', 'Ouput tracing messages')
        .action((script, args) => {
            if (args.trace) {
                enableTrance()
            }
            const config = getYuppyConfig(args.config);
            const runOptions: RunTaskOptions = {
                scriptNames: script.split(','),
                parallel: args.parallel || false,
                maxParallelScripts: parseInt(args.maxParallelScripts, 10) ? args.maxParallelScripts : 0,
                stopOnFail: args.stopOnFail || true,
                skipUnchanged: args.skipUnchanged || false
            };
            runTask(runOptions, config).then((code) => {
                process.stdin.pause();
                process.exit(code);
            }).catch((err) => {
                console.log(err);
                process.stdin.pause();
                process.exit(FAILURE_CODE);
            });
        });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

function getYuppyConfig(configPath: string): Config {
    configPath = configPath || DEFAULT_CONFIG_NAME;
    const isJs = configPath.split('.').pop() === 'js';
    const fullPath = path.resolve(process.cwd(), configPath);
    let config: ConfigSchema | null = null;
    if (isJs) {
        config = require(fullPath);
    } else {
        config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
    return new Config(<ConfigSchema>config);
}
