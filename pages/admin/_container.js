import Page from '../../components/Page'
import Link from '../../components/ActiveLink'

export default function Container({ children }) {
    return (
        <Page>
            <Page.Nav>
                <select className="v-h"></select>
            </Page.Nav>
            <Page.Sidebar>
                <div className="fw-b">Tasks</div>
                <div className="mt-0_5em">
                    <Link href="/admin/tasks/statuses" activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Statuses</a>
                    </Link>
                    <Link href="/admin/tasks/types" activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Types</a>
                    </Link>
                </div>
                <div className="fw-b mt-1em">Users</div>
                <div className="mt-0_5em">
                    <Link href="/admin/users/roles" activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Roles</a>
                    </Link>
                    <Link href="/admin/users/manager" activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manager</a>
                    </Link>
                </div>
            </Page.Sidebar>
            <Page.Content>
                {children}
            </Page.Content>
        </Page>
    )
}
