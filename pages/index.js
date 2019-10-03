import Page from 'Components/Page'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from 'Libs/esm/api'

function Index() {

    const [ loggedIn, setLoggedIn ] = useState(false)
    const [ organizations, setOrganizations ] = useState([])

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

    async function fetchOrganizations() {
        const organizations = await api.get('organizations').json()
        setOrganizations(organizations)
    }

    useEffect(() => {
        if(localStorage.getItem('token')) {
            setLoggedIn(true)
        }
        if(loggedIn) {
            fetchOrganizations()
        }
    }, [loggedIn])

    return (
        <Page>
            <Page.Nav>
                <select className="v-h"></select>
            </Page.Nav>
            {
                loggedIn &&
                <Page.Sidebar>
                    <div className="fw-b">Organizations</div>
                    <div className="mt-0_5em">
                        {
                            organizations.map(organization =>
                                <Link href="/[organization]" as={`/${organization.slug}`} key={organization.slug}>
                                    <a className="d-b mt-0_5em">{organization.name}</a>
                                </Link>
                            )
                        }
                    </div>
                    <div className="fw-b mt-1em">Other Links</div>
                    <div className="mt-0_5em">
                        <Link href="/admin">
                            <a>Admin Panel</a>
                        </Link>
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

export default Index
