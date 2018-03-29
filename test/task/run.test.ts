import { RunTaskOptions, runTask } from '../../lib/task/run';
import { Config } from '../../lib/model/config';
import { Project } from '../../lib/model/project';
import { runCommand } from '../../lib/cmd-util/cmd-util';

jest.mock('../../lib/cmd-util/cmd-util');

describe('Run task', () => {
    beforeEach(() => {
        (<jest.Mock>runCommand).mockClear();
        (<jest.Mock>runCommand).mockImplementation(() => {});
    });

    it('should run projects tasks in order', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            taskNames: ['build']
        };
        const projects = [
            createProject('p1', { build: '$test && echo p1', test: 'jest --config ./config.js' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('jest --config ./config.js && echo p1');
            expect(runCommand).toHaveBeenCalledWith('echo p2');
        });
    });

    it('should skip projects if task cmd was not found', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            taskNames: ['build']
        };
        const projects = [
            createProject('p1', { test: 'echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p2');
            expect(runCommand).toHaveBeenCalledTimes(1);
        });
    });

    it('should run projects tasks in parallel', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            taskNames: ['build'],
            parallel: true
        };
        const projects = [
            createProject('p1', { build: 'echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p1');
            expect(runCommand).toHaveBeenCalledWith('echo p2');
        });
    });

    it('should run projects tasks in parallel with max parallel tasks', () => {
        expect.assertions(2);

        const options: RunTaskOptions = {
            taskNames: ['build'],
            parallel: true,
            maxParallelTasks: 2
        };
        const projects = [
            createProject('p1', { build: 'echo p1' }),
            createProject('p2', { build: 'echo p2' }),
            createProject('p3', { build: 'echo p3' }),
        ];

        return runTask(options, projects).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledTimes(3);
        });
    });

    it('should fail when no projects', () => {
        expect.assertions(1);

        const options: RunTaskOptions = {
            taskNames: ['build']
        };
        const projects = [];

        return runTask(options, projects).catch((err) => {
            expect(err).toEqual('Runnable commands for task "build" was not found');
        });
    });

    it('should stop on first failed tasks', () => {
        expect.assertions(2);

        (<any>runCommand).mockImplementation(() => {
            throw new Error('ups');
        });

        const options: RunTaskOptions = {
            taskNames: ['build'],
            stopOnFail: true
        };
        const projects = [
            createProject('p1', { build: 'fail echo p1' }),
            createProject('p2', { build: 'echo p2' })
        ];

        return runTask(options, projects).catch((err) => {
            expect(runCommand).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('ups'));
        });
    });
});

function createProject(name, tasks: { [index: string]: string }) {
    return new Project({ name: name, path: `/app/${name}`, tasks: tasks });
}
