import Page from 'Components/Page'
import Link from 'Components/ActiveLink'
import { useRouter } from 'next/router'
import logout from 'Libs/esm/logout'

export default function Container({ children, Nav=null }) {
    const router = useRouter()
    const { organization } = router.query

    return (
        <Page>
            <Page.Nav>
                <div>
                    {Nav}
                </div>
                <div>
                    <select className="v-h"></select>
                    <Link href="/[organization]" as={`/${organization}`}>
                        <a className="c-i">Go Back</a>
                    </Link>
                    <a className="c-i ml-1em" href="#" onClick={logout}>Logout</a>
                </div>
            </Page.Nav>
            <Page.Sidebar>
            <div className="fw-b">Users</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/users/roles" as={`/${organization}/admin/users/roles`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Roles</a>
                    </Link>
                    <Link href="/[organization]/admin/users/manage" as={`/${organization}/admin/users/manage`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manage</a>
                    </Link>
                </div>
                <div className="fw-b mt-1em">Projects</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/projects/manage" as={`/${organization}/admin/projects/manage`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manage</a>
                    </Link>
                    <Link href="/[organization]/admin/projects/assign-members" as={`/${organization}/admin/projects/assign-members`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Assign Members</a>
                    </Link>
                    <Link href="/[organization]/admin/projects/categories" as={`/${organization}/admin/projects/categories`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Categories</a>
                    </Link>
                </div>
                <div className="fw-b mt-1em">Tasks</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/tasks/statuses" as={`/${organization}/admin/tasks/statuses`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Statuses</a>
                    </Link>
                    <Link href="/[organization]/admin/tasks/types" as={`/${organization}/admin/tasks/types`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Types</a>
                    </Link>
                    <Link href="/[organization]/admin/tasks/checklists" as={`/${organization}/admin/tasks/checklists`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Checklists</a>
                    </Link>
                </div>
            </Page.Sidebar>
            <Page.Content>
                {children}
            </Page.Content>
        </Page>
    )
}
