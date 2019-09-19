import Page from 'Components/Page'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Index() {

    const [ loggedIn, setLoggedIn ] = useState(false)
    const [ organizations, setOrganizations ] = useState(false)

    function login(e) {
        e.preventDefault()
        setLoggedIn(true)
    }

    useEffect(() => {
        setOrganizations([
            {
                name: 'ATC Online LLP',
                slug: 'atconline'
            },
            {
                name: 'Example Org',
                slug: 'example-org'
            }
        ])
    }, [])

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
                    <h1>Login</h1>
                    <form onSubmit={login}>
                        <div className="mt-0_5em">Username</div>
                        <div className="mt-0_5em">
                            <input type="text" required></input>
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
                :
                <div>You are logged in</div>
            }
            </Page.Content>
        </Page>
    )
}
