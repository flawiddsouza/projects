import Page from 'Components/Page'
import Link from 'Components/ActiveLink'
import { useRouter } from 'next/router'

export default function Container({ children }) {
    const router = useRouter()
    const { organization } = router.query

    return (
        <Page>
            <Page.Nav>
                <select className="v-h"></select>
            </Page.Nav>
            <Page.Sidebar>
                <div className="fw-b">Projects</div>
                <div className="mt-0_5em">
                    <Link href="/[organization]/admin/projects/manager" as={`/${organization}/admin/projects/manager`} activeClassName="td-n c-b">
                        <a className="d-b mt-0_25em">Manager</a>
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
                    <Link href="/[organization]/admin/users/manager" as={`/${organization}/admin/users/manager`} activeClassName="td-n c-b">
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
