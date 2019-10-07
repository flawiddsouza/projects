import Router from 'next/router'

export default function logout(e, callback=null) {
    e.preventDefault()
    if(confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token')
        if(!callback) {
            Router.push('/')
        } else {
            callback()
        }
    }
}
