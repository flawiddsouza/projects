import { useState, Fragment } from 'react'
import Container from "./_container";

export default function Index() {

    const [ loggedIn, setLoggedIn ] = useState(false)

    function login(e) {
        e.preventDefault()
        setLoggedIn(true)
    }

    return (
        <Container>
            {
                !loggedIn ?
                <div>
                    <h1>Login</h1>
                    <form onSubmit={login}>
                        <div className="mt-0_5em">Username</div>
                        <div className="mt-0_5em">
                            <input type="text" required></input>
                        </div>
                        <div className="mt-0_5em">Password</div>
                        <div className="mt-0_5em">
                            <input type="password" required></input>
                        </div>
                        <div className="mt-1em">
                            <button>Login</button>
                        </div>
                    </form>
                </div>
                :
                <div>Admin Home</div>
            }
        </Container>
    )
}
