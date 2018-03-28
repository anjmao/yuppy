const node = 'node';
const webpack = `${node} ./node_modules/webpack-cli/bin/webpack.js`
module.exports = {
    'projects': [
        {
            'name': 'Angular app',
            'tasks': {
                'start': `${webpack} --watch --config ./webpack/angular.webpack.js`,
                'build': `${webpack} --config ./config/angular.webpack.js`,
                'echo': 'echo Hello Angular',
                'err': 'Angular error please'
            }
        },
        {
            'name': 'Vue app',
            'tasks': {
                'start': `${webpack} --watch --config ./webpack/vue.webpack.js`,
                'build': `${webpack} --config ./config/vue.webpack.js`,
                'echo': 'echo Hello Vue',
                'err': 'Vue error please'
            }
        },
        {
            'name': 'React app',
            'tasks': {
                'start': `${webpack} --watch --config ./webpack/react.webpack.js`,
                'build': `${webpack} --config ./config/react.webpack.js`,
                'echo': 'echo Hello React',
                'err': 'React error please'
            }
        }
    ]
}
