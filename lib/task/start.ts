import * as inquirer from 'inquirer';
import { runCommand } from '../util/cmd-util';
import { Config } from '../model/config';

export function startTask(config: Config): Promise<any> {
    const projectNames = config.packages.map(x => x.name);

    return inquirer
        .prompt({
            type: 'list',
            name: 'package',
            message: 'Select package',
            choices: projectNames
        })
        .then((res: { package: string}) => {
            const project = config.getProject(res.package);
            const taskNames = Object.keys(project.scripts).map(x => x);
            return inquirer.prompt({
                type: 'list',
                name: 'script',
                message: 'What script do you want to run?',
                choices: taskNames
            }).then((res: { script: string }) => {
                const cmd = project.getCmd(res.script);
                return runCommand(cmd);
            });
        });
}
