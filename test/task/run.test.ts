import { RunTaskOptions, runTask } from '../../lib/task/run';
import { Config } from '../../lib/model/config';
import { Package } from '../../lib/model/package';
import { runCommand } from '../../lib/util/cmd-util';
import { gitExists, gitDiff, getLastCommitMessage } from '../../lib/util/git-util';

jest.mock('../../lib/util/cmd-util');
jest.mock('../../lib/util/git-util');

describe('Run task', () => {
    beforeEach(() => {
        (<jest.Mock>gitExists).mockClear();
        (<jest.Mock>gitDiff).mockClear();
        (<jest.Mock>getLastCommitMessage).mockClear();
        (<jest.Mock>runCommand).mockClear();
        (<jest.Mock>runCommand).mockImplementation(() => { });
    });

    it('should run packages scripts in order', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            scriptNames: ['build']
        };
        const packages = [
            createPackage('p1', { build: '$test && echo p1', test: 'jest --config ./config.js' }),
            createPackage('p2', { build: 'echo p2' })
        ];

        return runTask(options, createConfig(packages)).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('jest --config ./config.js && echo p1');
            expect(runCommand).toHaveBeenCalledWith('echo p2');
        });
    });

    it('should skip packages if task cmd was not found', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            scriptNames: ['build']
        };
        const packages = [
            createPackage('p1', { test: 'echo p1' }),
            createPackage('p2', { build: 'echo p2' })
        ];

        return runTask(options, createConfig(packages)).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p2');
            expect(runCommand).toHaveBeenCalledTimes(1);
        });
    });

    it('should run packages scripts in parallel', () => {
        expect.assertions(3);

        const options: RunTaskOptions = {
            scriptNames: ['build'],
            parallel: true
        };
        const packages = [
            createPackage('p1', { build: 'echo p1' }),
            createPackage('p2', { build: 'echo p2' })
        ];

        return runTask(options, createConfig(packages)).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p1');
            expect(runCommand).toHaveBeenCalledWith('echo p2');
        });
    });

    it('should run packages scripts in parallel with max parallel scripts', () => {
        expect.assertions(2);

        const options: RunTaskOptions = {
            scriptNames: ['build'],
            parallel: true,
            maxParallelScripts: 2
        };
        const packages = [
            createPackage('p1', { build: 'echo p1' }),
            createPackage('p2', { build: 'echo p2' }),
            createPackage('p3', { build: 'echo p3' }),
        ];

        return runTask(options, createConfig(packages)).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledTimes(3);
        });
    });

    it('should fail when no packages', () => {
        expect.assertions(1);

        const options: RunTaskOptions = {
            scriptNames: ['build']
        };
        const packages = [];

        return runTask(options, createConfig(packages)).catch((err) => {
            expect(err).toEqual('Runnable commands for script "build" was not found');
        });
    });

    it('should stop on first failed scripts', () => {
        expect.assertions(2);

        (<any>runCommand).mockImplementation(() => {
            throw new Error('ups');
        });

        const options: RunTaskOptions = {
            scriptNames: ['build'],
            stopOnFail: true
        };
        const packages = [
            createPackage('p1', { build: 'fail echo p1' }),
            createPackage('p2', { build: 'echo p2' })
        ];

        return runTask(options, createConfig(packages)).catch((err) => {
            expect(runCommand).toHaveBeenCalledTimes(1);
            expect(err).toEqual(new Error('ups'));
        });
    });

    describe('diff cheking', () => {

        it('should run only changed project paths scripts', () => {
            expect.assertions(3);

            (<jest.Mock>gitExists).mockReturnValue(true);
            (<jest.Mock>gitDiff).mockReturnValue([
                '/app/p1/main.ts',
                '/app/p1/style.css'
            ]);

            const options: RunTaskOptions = {
                scriptNames: ['build'],
                skipUnchanged: true
            };
            const packages = [
                createPackage('p1', { build: 'echo p1' }),
                createPackage('p2', { build: 'echo p2' })
            ];

            return runTask(options, createConfig(packages)).then((res) => {
                expect(res).toBe(0);
                expect(gitDiff).toHaveBeenCalledTimes(1);
                expect(runCommand).toHaveBeenCalledTimes(1)
            });
        });
        

        it('should not run scripts when project paths are not changed', () => {
            expect.assertions(2);

            (<jest.Mock>gitExists).mockReturnValue(true);
            (<jest.Mock>gitDiff).mockReturnValue([]);

            const options: RunTaskOptions = {
                scriptNames: ['build'],
                skipUnchanged: true
            };
            const packages = [
                createPackage('p1', { build: 'echo p1' }),
                createPackage('p2', { build: 'echo p2' })
            ];

            return runTask(options, createConfig(packages)).then((res) => {
                expect(res).toBe(0);
                expect(runCommand).toHaveBeenCalledTimes(0);
            });
        });

        it('should run all scripts when global paths are changed', () => {
            expect.assertions(2);

            (<jest.Mock>gitExists).mockReturnValue(true);
            (<jest.Mock>gitDiff).mockReturnValue([
                '/user/global/webpack.js',
                '/user/global/jest.config.js'
            ]);

            const options: RunTaskOptions = {
                scriptNames: ['build'],
                skipUnchanged: true
            };
            const packages = [
                createPackage('p1', { build: 'echo p1' }),
                createPackage('p2', { build: 'echo p2' })
            ];
            const globalPaths = [
                'global/'
            ];

            return runTask(options, createConfig(packages, null, globalPaths)).then((res) => {
                expect(res).toBe(0);
                expect(runCommand).toHaveBeenCalledTimes(2)
            });
        });

        it('should run scripts when project paths are not changed and last commit message contains force commit message', () => {
            expect.assertions(2);

            (<jest.Mock>gitExists).mockReturnValue(true);
            (<jest.Mock>gitDiff).mockReturnValue([]);
            (<jest.Mock>getLastCommitMessage).mockReturnValue('this commit message contains RB comment');

            const options: RunTaskOptions = {
                scriptNames: ['build'],
                skipUnchanged: true
            };
            const packages = [
                createPackage('p1', { build: 'echo p1' }),
                createPackage('p2', { build: 'echo p2' })
            ];
            const config = createConfig(packages, 'RB');
            return runTask(options, config).then((res) => {
                expect(res).toBe(0);
                expect(runCommand).toHaveBeenCalledTimes(2);
            });
        });

    });
});

function createConfig(packages: Package[] = [], forceCommitMessage?: string, globalPaths: string[] = []) {
    return new Config({
        packages,
        forceCommitMessage,
        globalPaths
    });
}

function createPackage(name, scripts: { [index: string]: string }) {
    return new Package({ 
        name: name,
        paths: [`/app/${name}`],
        baseDevBranch: 'dev',
        scripts: scripts
    });
}
