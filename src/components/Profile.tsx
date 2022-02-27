import User from "./classes/User";
import {useState} from "react";

export default function Profile(props: { user: User }) {
    const [user] = useState(props.user);

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>
                Your id: {user.id}
            </p>
        </div>
    );
}