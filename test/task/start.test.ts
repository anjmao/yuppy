import { startTask } from '../../lib/task/start';
import { Config } from '../../lib/model/config';
import { Package } from '../../lib/model/package';
import { runCommand } from '../../lib/util/cmd-util';
import * as inquirer from 'inquirer';
import { SUCCESS_CODE, FAILURE_CODE } from '../../lib/model/constant';

jest.mock('../../lib/util/cmd-util');
jest.mock('inquirer');

describe('Start task', () => {
    beforeEach(() => {
        (<jest.Mock>runCommand).mockClear();
    });

    it('should run selected task', () => {
        expect.assertions(2);

        (<jest.Mock>inquirer.prompt)
            .mockReturnValueOnce(Promise.resolve({ package: 'p1' }))
            .mockReturnValueOnce(Promise.resolve({ script: 'build' }));
        
        (<jest.Mock>runCommand).mockImplementation(() => Promise.resolve(SUCCESS_CODE));

        const config = createConfig([
            createPackage('p1', { build: 'echo p1' })
        ]);

        return startTask(config).then((res) => {
            expect(res).toBe(0);
            expect(runCommand).toHaveBeenCalledWith('echo p1');
        });
    });

    it('should fail when command fails', () => {
        expect.assertions(1);

        (<jest.Mock>inquirer.prompt)
            .mockReturnValueOnce(Promise.resolve({ package: 'p1' }))
            .mockReturnValueOnce(Promise.resolve({ script: 'build' }));
        
        (<jest.Mock>runCommand).mockImplementation(() => Promise.reject(FAILURE_CODE));

        const config = createConfig([
            createPackage('p1', { build: 'echo p1' })
        ]);

        return startTask(config).catch((res) => {
            expect(res).toBe(FAILURE_CODE);
        });
    });
});

function createConfig(packages: Package[]) {
    return new Config({ packages });
}

function createPackage(name, scripts: { [index: string]: string }) {
    return new Package({ name: name, paths: [`/app/${name}`], scripts: scripts });
}
