import Page from '../components/Page'

export default function Admin() {
    return (
        <Page>
            <Page.Nav>
                <select className="v-h"></select>
            </Page.Nav>
            <Page.Sidebar>
                <div className="fw-b">Tasks</div>
                <div className="mt-0_5em">
                    <div className="mt-0_25em">Statuses</div>
                    <div className="mt-0_25em">Types</div>
                </div>
                <div className="fw-b mt-1em">Users</div>
                <div className="mt-0_5em">
                    <div className="mt-0_25em">Roles</div>
                    <div className="mt-0_25em">Manager</div>
                </div>
            </Page.Sidebar>
            <Page.Content>
                Admin Content
            </Page.Content>
        </Page>
    )
}
