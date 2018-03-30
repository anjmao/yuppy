const node = 'node';
const webpack = `${node} ./node_modules/webpack-cli/bin/webpack.js`
module.exports = {
    'packages': [
        {
            'name': 'Angular app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/angular.webpack.js`,
                'build': `${webpack} --config ./config/angular.webpack.js`,
                'test': 'echo testing',
                'ci': '$build && $test'
            }
        },
        {
            'name': 'Vue app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/vue.webpack.js`,
                'build': `${webpack} --config ./config/vue.webpack.js`,
                'test': 'echo testing',
                'ci': '$build && $test'
            }
        },
        {
            'name': 'React app',
            'scripts': {
                'start': `${webpack} --watch --config ./config/react.webpack.js`,
                'build': `${webpack} --config ./config/react.webpack.js`,
                'test': 'echo testing',
                'ci': '$build && $test'
            }
        }
    ]
}
