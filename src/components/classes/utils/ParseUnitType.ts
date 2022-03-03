import UnitTypes from "../UnitTypes";
import MyFirstUnit from "../units/MyFirstUnit";
import Unit, {Side} from "../units/Unit";
import Position from "./Position";

export default function ParseUnitType(unitType: UnitTypes, unitName: string, unitLevel: number, unitID?: number, unitSide?: Side, unitPos?: Position, dateCollected?: string): Unit {
    switch (unitType.typeName) {
        case "MY_FIRST_UNIT":
            return new MyFirstUnit(unitName, unitLevel, unitID, unitSide, unitPos, dateCollected);
        default:
            throw new Error("Unknown unit type");
    }
}