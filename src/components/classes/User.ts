export default class User {
    private _id: number;
    private _username: string;
    private _loggedIn: boolean;
    private _amountUnits: number;
    private _maxAmountUnits: number;
    private _amountFormations: number;
    private _maxAmountFormations: number;

    constructor(id: number, username: string, loggedIn: boolean, amountUnits: number, maxAmountUnits: number, amountFormations: number, maxAmountFormations: number) {
        this._id = id;
        this._username = username;
        this._loggedIn = loggedIn;
        this._amountUnits = amountUnits;
        this._maxAmountUnits = maxAmountUnits;
        this._amountFormations = amountFormations;
        this._maxAmountFormations = maxAmountFormations;
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

    get amountFormations(): number {
        return this._amountFormations;
    }

    set amountFormations(value: number) {
        this._amountFormations = value;
    }

    get maxAmountFormations(): number {
        return this._maxAmountFormations;
    }

    set maxAmountFormations(value: number) {
        this._maxAmountFormations = value;
    }
}
