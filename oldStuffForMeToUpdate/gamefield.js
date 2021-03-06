const gameBoard = document.getElementById("gameboard")
let index = 0;
const defaultPlaybackSpeed = 750;
const movementDelayAmount = 2;
let historyPlaybackSpeed = defaultPlaybackSpeed; // speed per turn
let movementDelay = historyPlaybackSpeed / movementDelayAmount; // speed per movement

let unitsLeft = []
let unitsRight = []

let formations = []
let selectedFormation;

function speedUp(scalar) {
    historyPlaybackSpeed = defaultPlaybackSpeed / scalar;
    movementDelay = historyPlaybackSpeed / movementDelayAmount;
}

function speedDown(scalar) {
    historyPlaybackSpeed = defaultPlaybackSpeed * scalar;
    movementDelay = historyPlaybackSpeed / movementDelayAmount;
}

function resetSpeed() {
    historyPlaybackSpeed = defaultPlaybackSpeed;
    movementDelay = historyPlaybackSpeed / movementDelayAmount;
}

function manageHistoryPlayback(history) {
    if (index < history.length) {
        setTimeout(async function () {
            await playHistory(history)
        }, historyPlaybackSpeed);
    } else {
        console.log("WE DONE")
    }
}

async function playHistory(history) {
    let historyObject = history[index++];

    let unit = historyObject.user;

    if (unit.side === "ENEMY") {
        unit = findUnit(unitsRight, unit.id)
    } else {
        unit = findUnit(unitsLeft, unit.id)
    }

    if (unit !== undefined) {
        unit.health = historyObject.user.health;

        for (let i = 0; i < historyObject.targets.length; i++) {
            let target = historyObject.targets[i];

            if (target.side === "ENEMY") {
                target = findUnit(unitsRight, target.id)
            } else {
                target = findUnit(unitsLeft, target.id)
            }
            if (target !== undefined) {
                // that doesn't do anything yet, because the target isn't getting updated on the board right now (I would have to remove and place it as well)
                target.health = historyObject.targets[i].health;
            }
        }

        if (historyObject.type === "DIE") {
            console.log("UNIT DIED: " + unit.name + "(" + unit.id + ")")
            await removeUnit(unit)
        } else {
            await moveUnit(unit, historyObject.positions)
        }

        manageHistoryPlayback(history);
    } else {
        alert("UNIT UNDEFINED! FUUUUCK")
    }
}

async function initUnits(units) {
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        unit = parseUnitType(unit, unit.side);
        let unitPos = unit.position;
        if (unit.side === "ENEMY") {
            unitsRight.push(unit)
        } else {
            unitsLeft.push(unit)
        }
        await placeUnit(unit, unitPos);
    }

    return new Promise((resolve) => {
        resolve();
    })
}

function findUnit(array, id) {
    for (let i = 0; i < array.length; i++) {
        let unit = array[i];
        if (unit.id === id) return unit;
    }
    return undefined;
}

async function moveUnit(unit, positions) {
    if (positions.length <= 0) {
        await removeUnit(unit)
        await placeUnit(unit, unit.position)
    } else {
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i];
            if (i === 0) {
                await removeUnit(unit)
                await placeUnit(unit, position)
            } else {
                setTimeout(async function () {
                    await removeUnit(unit)
                    await placeUnit(unit, position)
                }, movementDelay);
            }
        }
    }

    return new Promise((resolve) => {
        resolve();
    })
}

async function placeUnit(unit, position) {
    $(gameBoard.rows[position.y].cells[position.x]).children(".unitCellWrapper").append(getUnitIcon(unit));

    unit.position = new Position(position.x, position.y);

    return new Promise((resolve) => {
        resolve();
    })
}

async function removeAllUnits(removeFromArray = false) {
    for (let i = 0; i < unitsLeft.length; i++) {
        let unit = unitsLeft[i];
        await removeUnit(unit, removeFromArray)
    }

    for (let i = 0; i < unitsRight.length; i++) {
        let unit = unitsRight[i];
        await removeUnit(unit, removeFromArray)
    }

    return new Promise((resolve) => {
        resolve();
    })
}

async function removeUnit(unit, removeFromArray = false) {
    let unitPos = unit.position;
    $(gameBoard.rows[unitPos.y].cells[unitPos.x]).children(".unitCellWrapper").empty();

    if (removeFromArray) {
        if (unit.side === "ENEMY") {
            unitsRight.splice(unitsRight.indexOf(unit), 1)
        } else {
            unitsLeft.splice(unitsLeft.indexOf(unit), 1)
        }
    }

    return new Promise((resolve) => {
        resolve();
    })
}

function getUnitIcon(unit) {
    let unitName = unit.name;
    let unitImage = unit.image;
    let unitLevel = unit.level;
    let unitHealth = unit.health;

    let divP = document.createElement("div")
    divP.classList.add("unitTextInfo")
    divP.classList.add(unit.side)
    divP.innerHTML = `<p>${unitName}</p><p>Level: ${unitLevel}</p><p>Health: ${unitHealth}</p>`;

    let imgUnit = document.createElement("img")
    imgUnit.classList.add("characterIconImage")
    imgUnit.src = unitImage;
    imgUnit.alt = ""

    let imgDiv = document.createElement("div")
    imgDiv.classList.add("unitImageWrapper")
    imgDiv.classList.add(unit.side)
    imgDiv.append(imgUnit)

    let wrapper = document.createElement("div")
    wrapper.append(divP, imgDiv)

    return wrapper
}

async function loadFormations() {
    const formationListElement = document.getElementById("formationList");

    let response = await fetch(`/api/user/getAllFormations`);

    if (response.ok) { // if HTTP-status is 200-299
        let json = await response.json();

        for (let i = 0; i < json.length; i++) {
            const formationID = json[i].id;
            let formation = JSON.parse(json[i].formationJson);

            // create list item containing formation id
            let listItem = document.createElement("li");
            listItem.id = "formation-" + formationID;
            listItem.classList.add("formationListItem");

            let button = document.createElement("button");
            button.classList.add("formationListButton");
            button.innerHTML = "" + i;
            button.addEventListener("click", function () {
                loadFormation(i, button);
            });
            listItem.appendChild(button);
            formationListElement.appendChild(listItem);

            formations.push({formation: formation, id: formationID});
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

async function loadFormation(formationId, button) {
    toggleDisableButtons();

    await removeAllUnits()

    const allSelectedButtons = $(".selectedFormation");
    for (let i = 0; i < allSelectedButtons.length; i++) {
        allSelectedButtons[i].classList.remove("selectedFormation");
    }

    button.classList.add("selectedFormation");

    const formation = formations[formationId]
    for (let i = 0; i < formation.formation.length; i++) {
        const unit = parseUnitType(formation.formation[i], "FRIENDLY");
        unitsLeft.push(unit);
        await placeUnit(unit, unit.position);
    }

    selectedFormation = formation;

    toggleDisableButtons();
}

function toggleDisableButtons() {
    const allButtons = $(".formationListButton");
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].disabled = !allButtons[i].disabled;
    }
}

loadGridSizeAndDrawFieldAccordingly("battle").then(() => {
    loadFormations().then(() => ({}));
})

async function startBattle() {
    if (selectedFormation) {
        $("#temporaryContainer").empty();

        let response = await fetch(`/api/battle/getFightHistory/${selectedFormation.id}`);
        if (response.ok) { // if HTTP-status is 200-299
            let json = await response.json();

            await removeAllUnits(true);

            await initUnits(json.unitsLeft);
            await initUnits(json.unitsRight);
            manageHistoryPlayback(json.history);
        } else {
            alert("HTTP-Error: " + response.status);
        }
    }
}