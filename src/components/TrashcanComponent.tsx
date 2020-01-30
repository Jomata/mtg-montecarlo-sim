import React, {  } from "react"
import { useDrop } from "react-dnd";
import { TestCase } from "../models/TestCase";
import { DragItem } from "../definitions/types";

const TrashcanComponent: React.FC<{dropHandler:(id:number)=>void}> = (props) => {

    const [{ isOver }, dropRef] = useDrop({
        accept:[typeof TestCase],
        drop: (item:DragItem,monitor) => {
            props.dropHandler(item.id)
        },
        collect: mon => ({
            isOver: !!mon.isOver({shallow:true})
        })
    })

    return (
    <div id="trash" ref={dropRef} className={isOver?" hovered":""} >Drop here to delete</div>
    )
}

export default TrashcanComponent;