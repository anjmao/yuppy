const node = 'node';
const webpack = `${node} ./node_modules/webpack-cli/bin/webpack.js`
module.exports = {
    globalPaths: ['scripts'],
    packages: [
        {
            name: 'Angular app',
            paths: ['apps/angular'],
            baseDevBranch: 'master',
            scripts: {
                start: `${webpack} --watch --config ./config/angular.webpack.js`,
                build: `${webpack} --config ./config/angular.webpack.js`,
                test: 'echo testing',
                ci: '$build && $test'
            }
        },
        {
            name: 'Vue app',
            paths: ['apps/vue'],
            scripts: {
                start: `${webpack} --watch --config ./config/vue.webpack.js`,
                build: `${webpack} --config ./config/vue.webpack.js`,
                test: 'echo testing',
                ci: '$build && $test'
            }
        },
        {
            name: 'React app',
            paths: ['apps/react'],
            scripts: {
                start: `${webpack} --watch --config ./config/react.webpack.js`,
                build: `${webpack} --config ./config/react.webpack.js`,
                test: 'echo testing',
                ci: '$build && $test'
            }
        }
    ]
}
