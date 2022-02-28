import React from "react";
import "../assets/css/loading.css";

export default function Loader() {
    return (
        <div className="loader">
            <h1>Loading...</h1>
            {/*todo: show this text only after a certain amount of time!!!!*/}
            <p>If it's taking long, it's probably Heroku waking up...</p>
        </div>
    );
}