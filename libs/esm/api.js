import ky from 'ky-universal'

export default ky.extend({
    prefixUrl: '/api'
})
