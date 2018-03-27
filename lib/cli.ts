
import * as path from 'path';
import * as fs from 'fs';
import * as program from 'commander';
import startTask from './task/start';
import runTask, { RunTaskOptions } from './task/run';
import { YuppyConfig, Project } from './model/config';

const DEFAULT_CONFIG_NAME = 'yuppy.config.js';

exports.run = function () {
    program.version('0.0.1');

    program
        .command('start')
        .description('Select and run project command')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .action((args) => {
            const config = getYuppyConfig(args.config);
            startTask(config).then((code) => {
                process.stdin.pause();
                process.exit(code);
            });
        });

    program
        .command('run <command>')
        .description('Run given command for all project')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .option("-st, --stop-on-fail", "Stop on first failed command")
        .option("-sk, --skip-unchanged", "Skip command when project is not changed")
        .option("-p, --parallel", "Run in parallel")
        .option("-pm, --max-parallel-tasks [maxParallelTasks]", "Set max parallel tasks to run at the same time")
        .action((command, args) => {
            const config = getYuppyConfig(args.config);
            const runOptions: RunTaskOptions = {
                command: command,
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
            });
        });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

function getYuppyConfig(configPath: string): YuppyConfig {
    configPath = configPath || DEFAULT_CONFIG_NAME;
    const isJs = configPath.split('.').pop() === 'js';
    try {
        let config = null;
        if (isJs) {
            config = require(path.resolve(process.cwd(), configPath));
        } else {
            config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8'));
        }
        const projects = config.projects.map((x: any) => new Project({name: x.name, path: x.path, commands: x.commands}));
        return new YuppyConfig({projects: projects});
    } catch (err) {
        throw new Error(`yuppy config not found in path "${configPath}": ` + err);
    }
}
