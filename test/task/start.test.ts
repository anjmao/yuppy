import { startTask } from '../../lib/task/start';
import { Config } from '../../lib/model/config';
import { Project } from '../../lib/model/project';
import { runCommand } from '../../lib/cmd-util/cmd-util';
import * as inquirer from 'inquirer';
import { SUCCESS_CODE, FAILURE_CODE } from '../../lib/model/constant';

jest.mock('../../lib/cmd-util/cmd-util');
jest.mock('inquirer');

describe('Start task', () => {
    beforeEach(() => {
        (<jest.Mock>runCommand).mockClear();
    });

    it('should run selected task', () => {
        expect.assertions(2);

        (<jest.Mock>inquirer.prompt)
            .mockReturnValueOnce(Promise.resolve({ project: 'p1' }))
            .mockReturnValueOnce(Promise.resolve({ task: 'build' }));
        
        (<jest.Mock>runCommand).mockImplementation(() => Promise.resolve(SUCCESS_CODE));

        const config = createConfig([
            createProject('p1', { build: 'echo p1' })
        ]);

        return startTask(config).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p1');
        });
    });

    it('should fail when command fails', () => {
        expect.assertions(1);

        (<jest.Mock>inquirer.prompt)
            .mockReturnValueOnce(Promise.resolve({ project: 'p1' }))
            .mockReturnValueOnce(Promise.resolve({ task: 'build' }));
        
        (<jest.Mock>runCommand).mockImplementation(() => Promise.reject(FAILURE_CODE));

        const config = createConfig([
            createProject('p1', { build: 'echo p1' })
        ]);

        return startTask(config).catch((res) => {
            expect(res).toBe(FAILURE_CODE);
        });
    });
});

function createConfig(projects: Project[]) {
    return new Config({ projects });
}

function createProject(name, tasks: { [index: string]: string }) {
    return new Project({ name: name, path: `/app/${name}`, tasks: tasks });
}
