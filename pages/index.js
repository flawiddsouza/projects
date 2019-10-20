import Page from 'Components/Page'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from 'Libs/esm/api'
import logout from 'Libs/esm/logout'
import Router, { useRouter } from 'next/router'

function Index() {

    const [ loggedIn, setLoggedIn ] = useState(false)
    const [ organizations, setOrganizations ] = useState([])
    const [ isSuperAdmin, setIsSuperAdmin ] = useState(false)
    const router = useRouter()
    const { redirectTo } = router.query

    async function login(e) {
        e.preventDefault()
        let response = await api.post('auth/login', {
            json: {
                email: e.target.querySelectorAll('input')[0].value,
                password: e.target.querySelectorAll('input')[1].value
            }
        }).json()
        if(response.status === 'success') {
            localStorage.setItem('token', response.data.token)
            if(redirectTo) {
                Router.push(redirectTo)
                return
            }
            setLoggedIn(true)
        } else {
            alert(response.message)
        }
    }

    async function register(e) {
        e.preventDefault()
        let inputs = e.target.querySelectorAll('input')
        if(inputs[2].value !== inputs[3].value) {
            alert('Password and Confirm Password need to match')
            return
        }
        let response = await api.post('auth/register', {
            json: {
                name: inputs[0].value,
                email: inputs[1].value,
                password: inputs[2].value
            }
        }).json()
        if(response.status === 'success') {
            alert(response.message)
        } else {
            alert(response.message)
        }
        inputs[0].value = ''
        inputs[1].value = ''
        inputs[2].value = ''
        inputs[3].value = ''
    }

    async function fetchOrganizations(isSuperAdmin) {
        const organizations = await api.get('organizations').json()
        setOrganizations(organizations)
        if(!isSuperAdmin && organizations.length === 1) {
            Router.push('/' + organizations[0].slug)
        }
    }

    async function fetchIsSuperAdminAndOrganizations() {
        const isSuperAdmin = await api.get('is-super-admin').json()
        setIsSuperAdmin(isSuperAdmin)
        await fetchOrganizations(isSuperAdmin)
    }

    function logoutExtended(e) {
        logout(e, () => setLoggedIn(false))
    }

    async function forgotPassword(e) {
        e.preventDefault()
        let forgotPasswordEmail = prompt('Enter your email address')
        if(forgotPasswordEmail) {
            let response = await api.post('auth/forgot-password', {
                json: {
                    email: forgotPasswordEmail
                }
            }).json()

            if(response.status === 'success') {
                alert(response.message)
            } else {
                alert(response.message)
            }
        }
    }

    useEffect(() => {
        if(localStorage.getItem('token')) {
            setLoggedIn(true)
        }
        if(loggedIn) {
            fetchIsSuperAdminAndOrganizations()
        }
    }, [loggedIn])

    return (
        <Page>
            <Page.Nav>
                <select className="v-h"></select>
                {
                    loggedIn &&
                    <div>
                        {
                            isSuperAdmin &&
                            <Link href="/admin">
                                <a className="c-i">Admin Panel</a>
                            </Link>
                        }
                        <a className="c-i ml-1em" href="#" onClick={logoutExtended}>Logout</a>
                    </div>
                }
            </Page.Nav>
            {
                loggedIn &&
                <Page.Sidebar>
                    <div className="fw-b">Organizations</div>
                    <div className="mt-0_5em">
                        {
                            organizations.length > 0 ?
                            organizations.map(organization =>
                                <Link href="/[organization]" as={`/${organization.slug}`} key={organization.slug}>
                                    <a className="d-b mt-0_5em">{organization.name}</a>
                                </Link>
                            )
                            :
                            'You don\'t belong to any organizations'
                        }
                    </div>
                    </Page.Sidebar>
            }
            <Page.Content>
            {
                !loggedIn ?
                <div>
                    <div>
                        <h1>Login</h1>
                        <form onSubmit={login}>
                            <div className="mt-0_5em">Email</div>
                            <div className="mt-0_5em">
                                <input type="email" required></input>
                            </div>
                            <div className="mt-0_5em">Password</div>
                            <div className="mt-0_5em">
                                <input type="password" required></input>
                            </div>
                            <div className="mt-1em">
                                <button>Login</button>
                                <a className="ml-1em" href="#" onClick={forgotPassword}>Forgot Password?</a>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h1>Register</h1>
                        <form onSubmit={register}>
                            <div className="mt-0_5em">Name</div>
                            <div className="mt-0_5em">
                                <input type="text" required></input>
                            </div>
                            <div className="mt-0_5em">Email</div>
                            <div className="mt-0_5em">
                                <input type="email" required></input>
                            </div>
                            <div className="mt-0_5em">Password</div>
                            <div className="mt-0_5em">
                                <input type="password" required></input>
                            </div>
                            <div className="mt-0_5em">Confirm Password</div>
                            <div className="mt-0_5em">
                                <input type="password" required></input>
                            </div>
                            <div className="mt-1em">
                                <button>Register</button>
                            </div>
                        </form>
                    </div>
                </div>
                :
                <div>You are logged in</div>
            }
            </Page.Content>
        </Page>
    )
}

Index.getInitialProps = () => ({})

export default Index
