import { useState, useEffect } from 'react'

export default function Settings() {

    const [ selectedSidebarItem, setSelectedSidebarItem ] = useState('Account')

    return (
        <div className="d-f" style={{ height: '20em', width: '45em', margin: '-1em' }}>
            <div style={{ width: '15em', borderRight: '1px solid var(--border-color)' }} className="sidebar pt-1em">
                <div
                    className={`cur-p us-n sidebar-item ${selectedSidebarItem === 'Account' && 'active'}`}
                    onClick={() => setSelectedSidebarItem('Account')}
                >Account</div>
                {/* <div
                    className={`cur-p us-n sidebar-item ${selectedSidebarItem === 'Test' && 'active'}`}
                    onClick={() => setSelectedSidebarItem('Test')}
                >Account</div> */}
            </div>
            <div style={{ width: '100%' }} className="ml-2em mt-1_5em">
                {
                    selectedSidebarItem === 'Account' &&
                    <div>
                        <h3 className="mb-1em">Personal Information</h3>
                        <div>
                            <table className=" table table-comfortable table-width-auto">
                                <tbody>
                                    {/* <tr>
                                        <td>Photo</td>
                                        <td>
                                            <a href="#" onClick={e => e.preventDefault()}>Add</a>
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <td>Name</td>
                                        <td>
                                            Your Name
                                        </td>
                                        <td>
                                            <a href="#" onClick={e => e.preventDefault()}>Edit</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>
                                            test@example.com
                                        </td>
                                        <td>
                                            {/* <a href="#" onClick={e => e.preventDefault()}>Edit</a> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Password</td>
                                        <td>
                                            ******
                                        </td>
                                        <td>
                                            <a href="#" onClick={e => e.preventDefault()}>Edit</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
                {/* {
                    selectedSidebarItem === 'Test' &&
                    <div>
                        Test
                    </div>
                } */}
            </div>
            <style jsx>{`
                .sidebar-item {
                    padding-top: 0.5em;
                    padding-bottom: 0.5em;
                    padding-left: 1em;
                }
                .sidebar-item:hover, .sidebar-item.active {
                    color: white;
                }
                .sidebar-item:hover {
                    background-color: #bc0e43;
                }
                .sidebar-item.active {
                    background-color: var(--primary-color);
                    font-weight: bold;
                }
            `}</style>
        </div>
    )
}
