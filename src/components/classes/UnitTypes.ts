export default class UnitTypes {
    private _customNamesAllowed: boolean;
    private _typeName: string;
    private _defaultName: string;

    constructor(customNamesAllowed: boolean, typeName: string, defaultName: string) {
        this._customNamesAllowed = customNamesAllowed;
        this._typeName = typeName;
        this._defaultName = defaultName;
    }

    get customNamesAllowed(): boolean {
        return this._customNamesAllowed;
    }

    set customNamesAllowed(value: boolean) {
        this._customNamesAllowed = value;
    }

    get typeName(): string {
        return this._typeName;
    }

    set typeName(value: string) {
        this._typeName = value;
    }

    get defaultName(): string {
        return this._defaultName;
    }

    set defaultName(value: string) {
        this._defaultName = value;
    }
}