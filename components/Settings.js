import { useState, useEffect } from 'react'
import api from 'Libs/esm/api'
import Modal from 'Components/Modal'
import SettingsColorScheme from 'Components/SettingsColorScheme'

export default function Settings({ refreshProjectMembers=null }) {

    const [ selectedSidebarItem, setSelectedSidebarItem ] = useState('Account')
    const [ accountDetails, setAccountDetails ] = useState([])
    const [ showEditName, setShowEditName ] = useState(false)
    const [ showEditPassword, setShowEditPassword ] = useState(false)
    const [ value1, setValue1 ] = useState(null)
    const [ value2, setValue2 ] = useState(null)

    async function fetchAccountDetails() {
        const accountDetails = await api.get('user/account-details').json()
        setAccountDetails(accountDetails)
    }

    function startEditName(e) {
        e.preventDefault()
        setValue1(accountDetails.name)
        setShowEditName(true)
    }

    async function updateName(e) {
        e.preventDefault()

        setShowEditName(false)

        await api.put('user/account-details/name', {
            json: {
                name: value1
            }
        })

        fetchAccountDetails()

        if(refreshProjectMembers) {
            refreshProjectMembers()
        }
    }

    function startEditPassword(e) {
        e.preventDefault()
        setValue1('')
        setValue2('')
        setShowEditPassword(true)
    }

    async function updatePassword(e) {
        e.preventDefault()

        if(value1 !== value2) {
            alert('New Password and Confirm Password should match')
            return
        }

        setShowEditPassword(false)

        await api.put('user/account-details/password', {
            json: {
                password: value1
            }
        })

        alert('Password Sucessfully Updated')
    }

    useEffect(() => {
        if(selectedSidebarItem === 'Account') {
            fetchAccountDetails()
        }
    }, [selectedSidebarItem])

    return (
        <div className="d-f" style={{ height: '20em', width: '45em', margin: '-1em' }}>
            <div style={{ width: '15em', borderRight: '1px solid var(--border-color)' }} className="sidebar pt-1em">
                <div
                    className={`cur-p us-n sidebar-item ${selectedSidebarItem === 'Account' && 'active'}`}
                    onClick={() => setSelectedSidebarItem('Account')}
                >Account</div>
                <div
                    className={`cur-p us-n sidebar-item ${selectedSidebarItem === 'Color Scheme' && 'active'}`}
                    onClick={() => setSelectedSidebarItem('Color Scheme')}
                >Color Scheme</div>
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
                                            { accountDetails.name }
                                        </td>
                                        <td>
                                            <a href="#" onClick={e => startEditName(e)}>Edit</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>
                                            { accountDetails.email }
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
                                            <a href="#" onClick={e => startEditPassword(e)}>Edit</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
                {
                    selectedSidebarItem === 'Color Scheme' &&
                    <SettingsColorScheme></SettingsColorScheme>
                }
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
            <Modal showModal={showEditName} hideModal={() => setShowEditName(false)}>
                <form onSubmit={updateName}>
                    <div>Edit Name</div>
                    <div className="mt-0_5em">
                        <input type="text" value={value1} onChange={e => setValue1(e.target.value)} required autoFocus className="w-100p" required></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </form>
            </Modal>
            <Modal showModal={showEditPassword} hideModal={() => setShowEditPassword(false)}>
                <form onSubmit={updatePassword}>
                    <div>Edit Password</div>
                    <div className="mt-0_5em">
                        <div className="label">New Password</div>
                        <input type="text" value={value1} onChange={e => setValue1(e.target.value)} required autoFocus className="w-100p" required></input>
                    </div>
                    <div className="mt-0_5em">
                        <div className="label">Confirm Password</div>
                        <input type="text" value={value2} onChange={e => setValue2(e.target.value)} required className="w-100p" required></input>
                    </div>
                    <div className="mt-1em ta-r">
                        <button>Update</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
