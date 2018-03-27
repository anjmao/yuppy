// @ts-check
import * as inquirer from 'inquirer';
import { runCommand } from '../cmd-util/cmd-util';
import { YuppyConfig } from '../model/config';

export default function(config: YuppyConfig): Promise<any> {
    const projects = config.projects.map(x => x.name);

    return inquirer
        .prompt({
            type: 'list',
            name: 'project',
            message: 'Select project',
            choices: projects
        })
        .then((answers1: any) => {
            const project = config.projects.find(x => x.name === answers1.project);
            const commands = Object.keys(project.commands).map(x => x);
            return inquirer.prompt({
                type: 'list',
                name: 'command',
                message: 'What command do you want to run?',
                choices: commands
            }).then((command: any) => {
                const cmd = project.commands[command.command];
                return runCommand(command.command, cmd);
            });
        });
}