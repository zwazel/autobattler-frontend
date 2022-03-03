import UnitTypes from "../UnitTypes";
import Position from "../utils/Position";

export enum Side {
    FRIENDLY,
    ENEMY,
    NEUTRAL
}

export default class Unit {
    private _id: number;
    private _side: Side;
    private _type: UnitTypes;
    private _name: string;
    private _level: number;
    private _position: Position;
    private _health: number;
    private _image: string;

    constructor(name: string, level: number, image: string, type: UnitTypes, scaleAttributes: Function, id?: number, side?: Side, position?: Position) {
        this._id = id || -1;
        this._side = side || Side.NEUTRAL;
        this._type = type;
        this._name = name;
        this._level = level;
        this._position = position || new Position(0, 0);
        this._health = scaleAttributes(level);
        this._image = image;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get side(): Side {
        return this._side;
    }

    set side(value: Side) {
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

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
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