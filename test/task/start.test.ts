import startTask from '../../lib/task/start';
import { Config } from '../../lib/model/config';
import { Project } from '../../lib/model/project';
import { runCommand } from '../../lib/cmd-util/cmd-util';

jest.mock('../../lib/cmd-util/cmd-util');

describe('Sun task', () => {
    beforeEach(() => {
        (<any>runCommand).mockClear();
        (<any>runCommand).mockImplementation(() => { });
    });

    xit('should run projects tasks in order', () => {
        expect.assertions(2);

        const config = createConfig([
            createProject('p1', { build: 'echo p1' })
        ]);

        return startTask(config).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p1');
        });
    });
});

function createConfig(projects: Project[]) {
    return new Config({ projects });
}

function createProject(name, tasks: { [index: string]: string }) {
    return new Project({ name: name, path: `/app/${name}`, tasks: tasks });
}
