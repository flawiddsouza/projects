import Page from 'Components/Page'
import Link from 'Components/ActiveLink'
import { useRouter } from 'next/router'

export default function Container({ children, Nav=null }) {
    const router = useRouter()
    const { organization } = router.query

    return (
        <Page>
            <Page.Nav>
                <div>
                    {Nav}
                </div>
                <select className="v-h"></select>
            </Page.Nav>
            <Page.Sidebar>
                <div className="fw-b">Projects</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/projects/manage" as={`/${organization}/admin/projects/manage`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manage</a>
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
                </div>
                <div className="fw-b mt-1em">Users</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/users/roles" as={`/${organization}/admin/users/roles`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Roles</a>
                    </Link>
                    <Link href="/[organization]/admin/users/manage" as={`/${organization}/admin/users/manage`} activeClassName="td-n c-b">
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
