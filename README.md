# Yuppy
Projects management made simple.

## What is Yuppy
Yuppy allows you do describe your projects and their commands for easy to use development workflows.

## Getting started

* Install yuppy
```
npm install yuppy -g
```

* Create `yuppy.config.json` file under your projects root

```json
{
    "projects": [
        {
            "name": "Angular app",
            "commands": {
                "start": "webpack --watch --config ./webpack/angular.webpack.js",
                "test": "karma start"
            }
        },
        {
            "name": "Vue app",
            "commands": {
                "start": "webpack --watch --config ./webpack/vue.webpack.js",
                "test": "mocha"
            }
        },
        {
            "name": "React app",
            "commands": {
                "start": "webpack --watch --config ./webpack/react.webpack.js",
                "test": "jest"
            }
        },
        {
            "name": "Dotnet Core API",
            "commands": {
                "start": "dotnet run --project ./backend/api.csproj",
                "test": "dotnet test ./backend/api.tests.csproj"
            }
        }
    ]
}
```

* Run yuppy cli

```
yuppy start
```

* Select project

![](https://github.com/anjmao/yuppy/blob/master/select_project.png)

* Run command

![](https://github.com/anjmao/yuppy/blob/master/run_command.png)

## Built With

* [Commander.js](https://github.com/tj/commander.js/) - node.js command-line interfaces made easy
* [Inquirer.js](https://github.com/SBoudrias/Inquirer.js/) - A collection of common interactive command line user interfaces.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/anjmao/yuppy/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
