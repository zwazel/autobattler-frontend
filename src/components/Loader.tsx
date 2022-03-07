import React, {useEffect} from "react";
import "../assets/css/loading.css";

export default function Loader(props: { customText?: string, customAdditionalWarningText?: string, customTimerForWarningText?: number }) {
    const {customText} = props;
    const {customAdditionalWarningText} = props;
    const {customTimerForWarningText} = props;

    const [count, setCount] = React.useState(0);
    const waitTime = (customTimerForWarningText ? customTimerForWarningText : 10); // seconds to wait before showing the extra text

    useEffect(
        () => {
            const timer = () => {
                setCount(count + 1);
            }

            if (count >= waitTime) {
                return;
            }
            const id = setInterval(timer, 1000);
            return () => clearInterval(id);
        },
        [count, waitTime]
    );

    return (
        <div>
            <h1 className="loader">
                {customText ? customText : "Loading..."}
            </h1>
            {count >= waitTime &&
                <span className={"info"}>
                    {
                        customAdditionalWarningText ?
                            customAdditionalWarningText :
                            "If it's taking long, it's probably Heroku waking up..."
                    }
                </span>}
        </div>
    );
}