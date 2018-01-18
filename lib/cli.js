// @ts-check
'use strict';
const path = require('path');
const inquirer = require('inquirer');
const fs = require('fs');
const program = require('commander');
const exec = require('child_process').exec;

exports.run = function () {
    program
        .version('0.1.0')
        .option('-c, --config', 'Set configuration file').action(function (filePath) {
            const config = readProjectsConfig(filePath);
            handleCommands(config);
        })
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

function handleCommands(config) {
    const projects = config.projects.map(x => x.name);

    inquirer
        .prompt({
            type: 'list',
            name: 'project',
            message: 'Which project do you want to run?',
            choices: projects
        })
        .then((answers1) => {
            const selected = config.projects.find(x => x.name === answers1.project);
            const commands = Object.keys(selected.commands).map(x => x);
            inquirer.prompt({
                type: 'list',
                name: 'command',
                message: 'What command do you want to perform?',
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
    const child = exec(cmd,
        (error, stdout, stderr) => {
            console.log(stdout);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
}

function parseProjectPath(args) {
    if (!args || args.length === 0) {
        throw new Error('--projects argument is required');
    }
    const path = args[0].split('=')[1];
    return path;
}

function readProjectsConfig(file) {
    try {
        const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf8'));
        return projects;
    } catch (err) {
        throw new Error(`yuppy can not open file "${file}": ` + err);
    }
}