const withCSS = require('@zeit/next-css')
const path = require('path')
const { parsed: localEnv } = require('dotenv').config()
const webpack = require('webpack')

module.exports = withCSS({
    webpack(config) {
        config.resolve.alias['Components'] = path.join(__dirname, 'components')
        config.resolve.alias['Libs'] = path.join(__dirname, 'libs')

        config.plugins.push(new webpack.EnvironmentPlugin(localEnv))

        return config
    }
})

// used https://jaketrent.com/post/environment-variables-in-nextjs/ to add .env support to this project
