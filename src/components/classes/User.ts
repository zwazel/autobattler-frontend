export default class User {
    private _id: number;
    private _username: string;
    private _loggedIn: boolean;
    private _amountUnits: number;
    private _maxAmountUnits: number;

    constructor(id: number, username: string, loggedIn: boolean, amountUnits: number, maxAmountUnits: number) {
        this._id = id;
        this._username = username;
        this._loggedIn = loggedIn;
        this._amountUnits = amountUnits;
        this._maxAmountUnits = maxAmountUnits;
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

    get amountUnits(): number {
        return this._amountUnits;
    }

    set amountUnits(value: number) {
        this._amountUnits = value;
    }

    get maxAmountUnits(): number {
        return this._maxAmountUnits;
    }

    set maxAmountUnits(value: number) {
        this._maxAmountUnits = value;
    }
}
