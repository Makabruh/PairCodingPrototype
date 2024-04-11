import { Link } from "react-router-dom"

const Employer = () => {
    return (
        <section>
            <h1>Employers Page</h1>
            <br />
            <p>You must have Employer Access.</p>
            <div className="flexGrow">
                <Link to="/">Home</Link>
            </div>
        </section>
    )
}

export default Employer