import ky from 'ky-universal'
import Router from 'next/router'

export default ky.extend({
    hooks: {
        beforeRequest: [
            (_url, options) => {
                options.headers.set('Token', localStorage.getItem('token'));
            }
        ],
        afterResponse: [
            (_url, _options, response) => {
                if(response.status === 401) {
                    localStorage.removeItem('token')
                    Router.push('/')
                }
            }
        ]
    },
    prefixUrl: '/api'
})
