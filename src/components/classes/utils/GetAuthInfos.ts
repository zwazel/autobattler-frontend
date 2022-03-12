export interface userLoginInfos {
    usernameMinLength: number;
    usernameMaxLength: number;
    passwordMinLength: number;
    passwordMaxLength: number;
    rememberMeTimes: rememberMeTime[];
}

export interface rememberMeTime {
    time: number;
    text: string;
    ordinal: number;
    name: string;
}

export default async function GetAuthInfos() {
    return await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/public/server/userLoginInfo`)
        .then(r => r.json())
        .then(r => r as userLoginInfos);
}