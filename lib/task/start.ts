import * as inquirer from 'inquirer';
import { runCommand } from '../cmd-util/cmd-util';
import { Config } from '../model/config';

export default function(config: Config): Promise<any> {
    const projectNames = config.projects.map(x => x.name);

    return inquirer
        .prompt({
            type: 'list',
            name: 'project',
            message: 'Select project',
            choices: projectNames
        })
        .then((res: any) => {
            const project = config.getProject(res.project);
            const taskNames = Object.keys(project.tasks).map(x => x);
            return inquirer.prompt({
                type: 'list',
                name: 'task',
                message: 'What task do you want to run?',
                choices: taskNames
            }).then((res: any) => {
                const cmd = project.getCmd(res.task);
                return runCommand(cmd);
            });
        });
}
