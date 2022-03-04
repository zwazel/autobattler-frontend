import Position from "../classes/utils/Position";
import Unit from "../classes/units/Unit";

export default function IsPositionFree(units: Unit[], position: Position): boolean {
    for (let unit of units) {
        if (unit.position.x === position.x && unit.position.y === position.y) {
            return false;
        }
    }
    return true;
}