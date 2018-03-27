import runTask, { RunTaskOptions } from '../../lib/task/run';
import { YuppyConfig, Project } from '../../lib/model/config';
import { runCommand } from '../../lib/cmd-util/cmd-util';

jest.mock('../../lib/cmd-util/cmd-util');

describe('run task tests', () => {
    beforeEach(() => {
        (<any>runCommand).mockClear();
        (<any>runCommand).mockImplementation(() => {});
    });

    it('should run projects command in order', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            command: 'build'
        };
        const projects = [
            createProject('p1', { build: 'echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('build', 'echo p1');
            expect(runCommand).toHaveBeenCalledWith('build', 'echo p2');
        });
    });

    it('should run projects command in parallel', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            command: 'build',
            parallel: true
        };
        const projects = [
            createProject('p1', { build: 'echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('build', 'echo p1');
            expect(runCommand).toHaveBeenCalledWith('build', 'echo p2');
        });
    });

    it('should stop on first failed command', () => {
        expect.assertions(1);

        (<any>runCommand).mockImplementation(() => {
            return Promise.reject('ups');
        });

        const options: RunTaskOptions = {
            command: 'build',
            stopOnFail: true
        };
        const projects = [
            createProject('p1', { build: 'fail echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).catch((err) => {
            expect(runCommand).toHaveBeenCalledTimes(1);
        });
    });
});

function createProject(name, commands: { [index: string]: string }) {
    return new Project({ name: name, path: `/app/${name}`, commands });
}
