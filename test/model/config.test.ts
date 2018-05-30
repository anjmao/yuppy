import { Config, ConfigSchema } from '../../lib/model/config';

describe('Config model', () => {
    it('should create from config json object', () => {
        const json: ConfigSchema = {
            forceCommitMessage: 'RB',
            globalPaths: ['/p1'],
            packages: [
                { name: 'p1', paths: ['./p1'], baseDevBranch: 'dev', scripts: { build: 'go build main.go' } },
                { name: 'p2', paths: ['./p2'], scripts: { test: 'go test ./...' } }
            ]
        };

        const config = new Config(json);

        expect(config).toEqual({
            forceCommitMessage: 'RB',
            globalPaths: ['/p1'],
            packages: [
                { name: 'p1', paths: ['./p1'], baseDevBranch: 'dev', scripts: { build: 'go build main.go' } },
                { name: 'p2', paths: ['./p2'], baseDevBranch: 'master', scripts: { test: 'go test ./...' } }
            ]
        })
    });

    it('should throw when packages are not array', () => {
        const config = <any>{ packages: { should: { be: [] } } };
        expect(() => new Config(config)).toThrowError('Invalid configuration: packages must be an array');
    });

    it('should throw when packages are not defined', () => {
        const config = <any>{ packagessss: {}  };
        expect(() => new Config(config)).toThrowError('Invalid configuration: packages must be defined');
    });

    it('should throw when package name is not defiend', () => {
        const config = <any>{ packages: [{}]  };
        expect(() => new Config(config)).toThrowError('Invalid configuration: package name should be defined');
    });
});
