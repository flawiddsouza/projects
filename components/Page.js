import Head from 'next/head'
import Link from 'next/link'

function Page({ children }) {
    return (
        <div>
            <Head>
                <title>Projects - A Project Management Tool</title>
                <link rel="stylesheet" href="/static/global.css" />
                <link rel="stylesheet" href="/static/functional.css" />
            </Head>
            <main>
                <Link href="/"><div className="nav-logo">Projects</div></Link>
                {children}
            </main>
        </div>
    )
}

function Nav({ children }) {
    return <div className="nav-area d-f flex-jc-sb">{children}</div>
}

function Sidebar({ children }) {
    return <div className="sidebar">{children}</div>
}

function Content({ children }) {
    return <div className="main">{children}</div>
}

Page.Nav = Nav
Page.Sidebar = Sidebar
Page.Content = Content

export default Page
