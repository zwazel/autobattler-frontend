import Unit from "../units/Unit";
import ParseUnitType from "./ParseUnitType";
import UnitTypes from "../UnitTypes";

export default async function GetAllUnitsOfUser(unitTypes: UnitTypes[]): Promise<Unit[]> {
    let units: Unit[] = [];

    await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/getAllUnits`, {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(r => {
        return r.json()
    }).then(r => {
        for (let jsonUnit of r) {
            const unitType = unitTypes.find(ut => ut.typeName === jsonUnit.unitType);
            if (unitType) {
                let unit = ParseUnitType(unitType, jsonUnit.name, jsonUnit.level, jsonUnit.id, undefined, undefined, jsonUnit.dateCollected);
                units.push(unit);
            } else {
                throw new Error(`Unit type ${jsonUnit.unitType} not found`);
            }
        }
    });
    
    return units;
}