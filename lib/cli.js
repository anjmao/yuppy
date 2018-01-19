// @ts-check
'use strict';
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');
const program = require('commander');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

exports.run = function () {
    program.version('0.0.1');

    program
        .command('start [config]')
        .description('Start yuppy development workflow')
        .option("-s, --setup_mode [mode]", "Which setup mode to use")
        .action((configPath) => {
            configPath = configPath || 'yuppy.config.json';
            const config = readProjectsConfig(configPath);
            handleCommands(config);
        });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

function handleCommands(config) {
    const projects = config.projects.map(x => x.name);

    return inquirer
        .prompt({
            type: 'list',
            name: 'project',
            message: 'Select project',
            choices: projects
        })
        .then((answers1) => {
            const selected = config.projects.find(x => x.name === answers1.project);
            const commands = Object.keys(selected.commands).map(x => x);
            inquirer.prompt({
                type: 'list',
                name: 'command',
                message: 'What command do you want to run?',
                choices: commands
            }).then(answers2 => {
                runProjectCommand(selected, answers2.command);
            });
        });
}

function runProjectCommand(project, command) {
    const cmd = project.commands[command];
    if (!cmd) {
        console.log(`skipping: command "${command}" is not defined`);
        return;
    }
    console.log(`starting command "${cmd}"`);
    const child = spawnCommand(cmd, { stdio: 'inherit' });
    process.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    child.on('error', (error) => {
        console.error('command error: ' + error.toString());
    });

    child.on('exit', (code) => {
        console.log('command exited with code ' + code.toString());
        process.stdin.pause();
        child.kill();
        process.exit(code);
    });
}

function readProjectsConfig(configPath) {
    try {
        const projects = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8'));
        return projects;
    } catch (err) {
        throw new Error(`yuppy can not open file "${configPath}": ` + err);
    }
}

function spawnCommand(command, options) {
    var file, args;
    if (process.platform === 'win32') {
        file = 'cmd.exe';
        args = ['/s', '/c', '"' + command + '"'];
        options = Object.assign({}, options);
        options.windowsVerbatimArguments = true;
    } else {
        file = '/bin/sh';
        args = ['-c', command];
    }
    return spawn(file, args, options);
}