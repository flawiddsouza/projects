import Page from 'Components/Page'
import Link from 'Components/ActiveLink'

export default function Container({ children, Nav=null }) {
    return (
        <Page>
            <Page.Nav>
                <div>
                    {Nav}
                </div>
                <select className="v-h"></select>
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
