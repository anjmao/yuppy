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
        .then((res: any) => {
            const project = config.getProject(res.package);
            if (!project) {
                throw new Error(`Project ${res.package} was not found`);
            }
            const taskNames = Object.keys(project.scripts).map(x => x);
            return inquirer.prompt({
                type: 'list',
                name: 'script',
                message: 'What script do you want to run?',
                choices: taskNames
            }).then((res2: any) => {
                const cmd = project.getCmd(res2.script);
                if (!cmd) {
                    throw new Error(`Script ${res2.script} was not found`);
                }
                return runCommand(cmd);
            });
        });
}
