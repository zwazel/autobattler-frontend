export default class User {
    private _id: number;
    private _username: string;

    constructor(id: number, username: string) {
        this._id = id;
        this._username = username;
        console.log(`User ${username} created!`);
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
}
