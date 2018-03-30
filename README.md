# Yuppy
Monorepo packages development-production cli

## What is Yuppy
Yuppy allows you do describe multiple packages in config file and run command for each of them.

![yuppy](https://github.com/anjmao/yuppy/blob/master/yuppy.gif)


### Features
- [x] Show packages and run selected command in interactive command line
- [x] Run single or multiple packages commands
- [ ] Detect and skip command if package path is not changed during CI
- [ ] Jenkins integration
- [ ] Gitlab integration

## Getting started

* Install yuppy

using npm
```
npm install yuppy --save-dev
```
using Yarn
```
yarn add yuppy --dev
```

* Create `yuppy.config.js` (or yuppy.config.json) file under your root

```js
const node = 'node';
const webpack = `${node} ./node_modules/webpack-cli/bin/webpack.js`
module.exports = {
    'packages': [
        {
            'name': 'Angular app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/angular.webpack.js`,
                'build': `${webpack} --config ./config/angular.webpack.js`,
                'echo': 'echo Hello Angular',
                'err': 'Angular error please'
            }
        },
        {
            'name': 'Vue app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/vue.webpack.js`,
                'build': `${webpack} --config ./config/vue.webpack.js`,
                'echo': 'echo Hello Vue',
                'err': 'Vue error please'
            }
        },
        {
            'name': 'React app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/react.webpack.js`,
                'build': `${webpack} --config ./config/react.webpack.js`,
                'echo': 'echo Hello React',
                'err': 'React error please'
            }
        }
    ]
}
```

* Update pacakge.json scripts and add start command

```json
"scripts": {
    "start": "./node_modules/yuppy/bin/yuppy start"
},
```

## Api

* Run `yuppy -h` to see available commands

```
Usage: yuppy [options] [command]

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    start [options]         Select and run package script
    run [options] <script>  Run given script(s) for all project
```

* Run `yuppy start -h` to see start command options

```
Usage: start [options]

  Select and run package script

  Options:

    -c, --config [config]  Optional yuppy config file path
    -h, --help             output usage information
```

* Run `yuppy run -h` to see run command options

```
Usage: run [options] <script>

  Run given script(s) for all project


  Options:

    -c, --config [config]                            Optional yuppy config file path
    -s, --stop-on-fail                               Stop on first failed script
    -S, --skip-unchanged                             Skip script when project is not changed
    -p, --parallel                                   Run in parallel
    -P, --max-parallel-scripts [maxParallelScripts]  Set max parallel scripts to run at the same time
    -h, --help  
```

## Built With

* [Commander.js](https://github.com/tj/commander.js/) - node.js command-line interfaces made easy
* [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - A collection of common interactive command line user interfaces.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/anjmao/yuppy/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
