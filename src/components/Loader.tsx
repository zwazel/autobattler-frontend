import React, {useEffect} from "react";
import "../assets/css/loading.css";

export default function Loader() {
    const [count, setCount] = React.useState(0);
    const waitTime = 10; // seconds to wait before showing the extra text
    const timer = () => {
        setCount(count + 1);
    }

    useEffect(
        () => {
            if (count >= waitTime) {
                return;
            }
            const id = setInterval(timer, 1000);
            return () => clearInterval(id);
        },
        [count, timer]
    );

    return (
        <div>
            <h1 className="loader">Loading...</h1>
            {count >= waitTime && <span className={"info"}>If it's taking long, it's probably Heroku waking up...</span>}
        </div>
    );
}