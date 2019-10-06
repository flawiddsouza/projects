import ky from 'ky-universal'
import Router from 'next/router'

export default ky.extend({
    retry: {
        limit: 0
    },
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
                    if(location.pathname === '/') {
                        location.reload()
                    } else {
                        Router.push('/')
                    }
                }
            }
        ]
    },
    prefixUrl: '/api'
})
