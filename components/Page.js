import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'

function setCSSVariable(variable, value) {
    document.documentElement.style.setProperty(variable, value)
}

function Page({ children }) {

    useEffect(() => {
        const overrideDefaultColor = localStorage.getItem('overrideDefaultColor')
        if(overrideDefaultColor) {
            setCSSVariable('--primary-color', overrideDefaultColor)
        }
        document.querySelector('main').style.visibility = ''
    })

    return (
        <div>
            <Head>
                <title>Projects - A Project Management Tool</title>
                <link rel="stylesheet" href="/static/global.css" />
                <link rel="stylesheet" href="/static/functional.css" />
            </Head>
            <main style={{ visibility: 'hidden' }}>
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

function Content({ children, paddingBottom0=false }) {
    return <div className={`main${paddingBottom0 ? ' pb-0-i': ''}`}>{children}</div>
}

Page.Nav = Nav
Page.Sidebar = Sidebar
Page.Content = Content

export default Page
