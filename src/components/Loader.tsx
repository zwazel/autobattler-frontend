import React, {useEffect} from "react";
import "../assets/css/loading.css";

export default function Loader() {
    const [count, setCount] = React.useState(0);
    const waitTime = 5; // seconds to wait before showing the extra text
    const timer = () => setCount(count + 1);

    useEffect(
        () => {
            if (count <= 0) {
                return;
            }
            const id = setInterval(timer, 1000);
            return () => clearInterval(id);
        },
        [count]
    );

    return (
        <div className="loader">
            <h1>Loading...</h1>
            {count > waitTime && <h2>If it's taking long, it's probably Heroku waking up...</h2>}
        </div>
    );
}