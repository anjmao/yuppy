import * as path from 'path';
import * as fs from 'fs';
import * as program from 'commander';
import startTask from './task/start';
import runTask, { RunTaskOptions } from './task/run';
import { Config, ConfigSchema } from './model/config';
import { FAILURE_CODE } from './model/constant';

const DEFAULT_CONFIG_NAME = 'yuppy.config.js';

exports.run = function () {
    program.version('0.0.1');

    program
        .command('start')
        .description('Select and run project task')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .action((args) => {
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
        .command('run <task>')
        .description('Run given task(s) for all project')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .option("-s, --stop-on-fail", "Stop on first failed task")
        .option("-S, --skip-unchanged", "Skip task when project is not changed")
        .option("-p, --parallel", "Run in parallel")
        .option("-P, --max-parallel-tasks [maxParallelTasks]", "Set max parallel tasks to run at the same time")
        .action((task, args) => {
            const config = getYuppyConfig(args.config);
            const runOptions: RunTaskOptions = {
                taskNames: task.split(','),
                parallel: args.parallel,
                maxParallelTasks: args.maxParallelTasks,
                stopOnFail: args.stopOnFail,
                skipUnchanged: false
            };
            runTask(runOptions, config.projects).then((code) => {
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
    try {
        let config: ConfigSchema = null;
        if (isJs) {
            config = require(path.resolve(process.cwd(), configPath));
        } else {
            config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8'));
        }
        return Config.deserialize(config);
    } catch (err) {
        throw new Error(`Can not open config file in path "${configPath}": ${err}`);
    }
}
