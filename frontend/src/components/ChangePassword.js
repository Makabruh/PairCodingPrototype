import { useState } from "react"

const ChangePassword = () => {

    const [pwd, setPwd] = useState();
    const [matchPwd, setMatchPwd] = useState();

    return (
        <section>
            <h1>Change Your Password Here</h1>
            <form onSubmit={handleSubmit}>
                <input
                type="password" 
                id="password" 
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required>Enter Password</input>
                <input
                type="password" 
                id="match-password"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={matchPwd}
                required>Enter Password</input>
                <button></button>
            </form>
           
        </section>
    )

}