import Unit from "./Unit";
import UnitImage from "../../../assets/img/units/my_first_unit/goodSoupMobil.png";
import UnitTypes from "../UnitTypes";
import Position from "../utils/Position";

export default class MyFirstUnit extends Unit {
    constructor(id: number, side: string, name: string, level: number, position: Position) {
        super(id, side, new UnitTypes(true, "MY_FIRST_UNIT", "MY_FIRST_UNIT"), name, level, position, UnitImage, function () {
                const defaultHealth = 10;
                return (defaultHealth + (defaultHealth * ((level - 1) * 0.25)))
            }
        );
    }
}