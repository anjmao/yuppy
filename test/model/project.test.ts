import { Project } from '../../lib/model/project';

describe('Project model', () => {
    it('should get cmd by name and inline tasks', () => {
        const project = new Project({
            name: 'p1',
            path: './',
            tasks: {
                build: 'webpack --config ./webpack.config.js',
                test: 'jest --config ./test.js',
                all: '$build && $test',
                echo: 'hi doggy'
            }
        });

        let cmd = project.getCmd('all');
        expect(cmd).toEqual('webpack --config ./webpack.config.js && jest --config ./test.js');

        cmd = project.getCmd('build');
        expect(cmd).toEqual('webpack --config ./webpack.config.js');

        cmd = project.getCmd('echo');
        expect(cmd).toEqual('hi doggy');
    });

    it('should return null when task not found', () => {
        const project = new Project({
            name: 'p1',
            path: './',
            tasks: {
                all: 'echo hi doggy'
            }
        });

        expect(project.getCmd('uh')).toEqual(null);
    });
});