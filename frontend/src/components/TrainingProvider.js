import { Link } from "react-router-dom"

const TrainingProvider = () => {
    return (
        <section>
            <h1>Training Provider Page</h1>
            <br />
            <p>You must have Training Provider Access.</p>
            <div className="flexGrow">
                <Link to="/">Home</Link>
            </div>
        </section>
    )
}

export default TrainingProvider