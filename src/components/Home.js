import Notes from './Notes';

export default function Home({ showAlert }) {
    return (
        <div className="home-page">
            <div className="home-welcome">
                <h2 className="home-heading">
                    Welcome back <i className="fa-solid fa-hand-wave text-accent"></i>
                </h2>
                <p className="home-sub">
                    All your notes are here — organised, secure, and ready when you are.
                </p>
            </div>
            <Notes showAlert={showAlert} />
        </div>
    );
}
