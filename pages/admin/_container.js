import Page from 'Components/Page'
import Link from 'Components/ActiveLink'
import logout from 'Libs/esm/logout'
import { Fragment } from 'react'

export default function Container({ children, Nav=null }) {

    return (
        <Page>
            <Page.Nav>
                <div>
                    {Nav}
                </div>
                <Fragment>
                    <select className="v-h"></select>
                    <div>
                        <Link href="/">
                            <a className="c-i">Go Back</a>
                        </Link>
                        <a className="c-i ml-1em" href="#" onClick={logout}>Logout</a>
                    </div>
                </Fragment>
            </Page.Nav>
            <Page.Sidebar>
                <div className="fw-b">Organizations</div>
                <div className="mt-0_5em">
                    <Link href="/admin/organizations/manage" activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manage</a>
                    </Link>
                </div>
            </Page.Sidebar>
            <Page.Content>
                {children}
            </Page.Content>
        </Page>
    )
}
