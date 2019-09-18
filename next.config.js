const withCSS = require('@zeit/next-css')
module.exports = withCSS()

const path = require('path')
module.exports = {
    webpack(config, options) {
        config.resolve.alias['Components'] = path.join(__dirname, 'components')
        config.resolve.alias['Libs'] = path.join(__dirname, 'libs')
        return config
    }
}
