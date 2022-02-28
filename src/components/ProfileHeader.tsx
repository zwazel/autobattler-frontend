import User from "./classes/User";
import {useState} from "react";
import {Outlet} from "react-router-dom";

export default function ProfileHeader(props: { user: User }) {
    const [user] = useState(props.user);

    return (
        <>
            <div className="profile-header">
                <div className="profile-header-image">
                    {/*<img src={user.profileImage} alt="Profile" />*/}
                </div>
                <div className="profile-header-info">
                    <div className="profile-header-info-username">
                        @{user.username}
                    </div>
                </div>
            </div>
            <Outlet/>
        </>
    );
}