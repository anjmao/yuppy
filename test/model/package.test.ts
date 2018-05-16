import { Package } from '../../lib/model/package';

describe('Package model', () => {
    it('should get cmd by name and inline tasks', () => {
        const pkg = new Package({
            name: 'p1',
            paths: ['./'],
            scripts: {
                build: 'webpack --config ./webpack.config.js',
                test: 'jest --config ./test.js',
                all: '$build && $test',
                echo: 'hi doggy'
            }
        });

        let cmd = pkg.getCmd('all');
        expect(cmd).toEqual('webpack --config ./webpack.config.js && jest --config ./test.js');

        cmd = pkg.getCmd('build');
        expect(cmd).toEqual('webpack --config ./webpack.config.js');

        cmd = pkg.getCmd('echo');
        expect(cmd).toEqual('hi doggy');
    });

    it('should return null when task not found', () => {
        const pkg = new Package({
            name: 'p1',
            paths: ['./'],
            scripts: {
                all: 'echo hi doggy'
            }
        });

        expect(pkg.getCmd('uh')).toEqual(null);
    });
});