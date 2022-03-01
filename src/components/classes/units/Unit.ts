import UnitTypes from "../UnitTypes";

export default class Unit {
    private _id: number;
    private _side: string;
    private _type: UnitTypes;
    private _name: string;
    private _level: number;
    private _position: {
        x: number;
        y: number;
    };
    private _health: number;
    private _image: string;

    constructor(id: number, side: string, type: UnitTypes, name: string, level: number, position: { x: number; y: number }, image: string, scaleAttributes: Function) {
        this._id = id;
        this._side = side;
        this._type = type;
        this._name = name;
        this._level = level;
        this._position = position;
        this._health = scaleAttributes(level);
        this._image = image;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get side(): string {
        return this._side;
    }

    set side(value: string) {
        this._side = value;
    }

    get type(): UnitTypes {
        return this._type;
    }

    set type(value: UnitTypes) {
        this._type = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this._level = value;
    }

    get position(): { x: number; y: number } {
        return this._position;
    }

    set position(value: { x: number; y: number }) {
        this._position = value;
    }

    get health(): number {
        return this._health;
    }

    set health(value: number) {
        this._health = value;
    }

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }
}