export default class User {
    private _id: number;
    private _username: string;
    private _loggedIn: boolean;

    constructor(id: number, username: string, loggedIn: boolean) {
        this._id = id;
        this._username = username;
        this._loggedIn = loggedIn;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get loggedIn(): boolean {
        return this._loggedIn;
    }

    set loggedIn(value: boolean) {
        this._loggedIn = value;
    }
}