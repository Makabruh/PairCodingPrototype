import { Link } from "react-router-dom"

const Apprentice = () => {
    return (
        <section>
            <h1>Apprentice Page</h1>
            <br />
            <p>You must have Apprentice Access.</p>
            <div className="flexGrow">
                <Link to="/">Home</Link>
            </div>
        </section>
    )
}

export default Apprentice