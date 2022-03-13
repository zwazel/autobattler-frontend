import Unit, {Side} from "./Unit";
import UnitImage from "../../../assets/img/units/my_first_unit/goodSoupMobil.png";
import UnitTypes from "../UnitTypes";
import Position from "../utils/Position";

export default class MyFirstUnit extends Unit {
    constructor(name: string, level: number, id?: number, priority?: number, side?: Side, position?: Position, dateCollected?: string) {
        super(name, level, UnitImage,
            new UnitTypes(true, "MY_FIRST_UNIT", "MY_FIRST_UNIT"),
            function () {
                const defaultHealth = 10;
                return (defaultHealth + (defaultHealth * ((level - 1) * 0.25)))
            },
            id, priority, side, position, dateCollected);
    }
}