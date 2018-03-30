import { Config, ConfigSchema } from '../../lib/model/config';

describe('Config model', () => {
    it('should create from config json object', () => {
        const json: ConfigSchema = {
            packages: [
                { name: 'p1', path: './p1', scripts: { build: 'go build main.go' } },
                { name: 'p2', path: './p2', scripts: { test: 'go test ./...' } }
            ]
        };

        const config = Config.deserialize(json);

        expect(config).toEqual({
            packages: [
                { name: 'p1', path: './p1', scripts: { build: 'go build main.go' } },
                { name: 'p2', path: './p2', scripts: { test: 'go test ./...' } }
            ]
        })
    });

    it('should throw when packages are not array', () => {
        const config = <any>{ packages: { should: { be: [] } } };
        expect(() => Config.deserialize(config)).toThrowError('Invalid configuration: packages must be an array');
    });

    it('should throw when packages are not defined', () => {
        const config = <any>{ packagessss: {}  };
        expect(() => Config.deserialize(config)).toThrowError('Invalid configuration: packages must be defined');
    });

    it('should throw when package name is not defiend', () => {
        const config = <any>{ packages: [{}]  };
        expect(() => Config.deserialize(config)).toThrowError('Invalid configuration: package name should be defined');
    });
});
