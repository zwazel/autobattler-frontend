import Unit from "../units/Unit";
import {Draggable, Droppable} from "react-beautiful-dnd";

export default function UnitPriorityDraggableList(props: { units: Unit[] }) {
    const {units} = props;

    return (
        <Droppable
            droppableId="unit-priority-list"
            direction="vertical"
            type="UNIT"
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                        padding: "0.5rem",
                        backgroundColor: snapshot.isDraggingOver ? "#f5f5f5" : "white",
                    }}
                >
                    {units.map((unit, index) => (
                        <Draggable
                            key={unit.id}
                            draggableId={"" + unit.id}
                            index={(unit.priority < 0) ? index : unit.priority}
                        >
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                        ...provided.draggableProps.style,
                                        userSelect: "none",
                                        padding: "0.5rem",
                                        margin: "0.5rem",
                                        backgroundColor: snapshot.isDragging ? "#ff0000" : "aqua",
                                    }}
                                >
                                    {unit.name}
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}