import { SingleTest } from "../models/SingleTest"
import React, { useContext } from "react"
import { CompareType } from "../definitions/enums"
import { COLOR_ZERO, COLOR_HUND, HandlersContext } from "../definitions/constants"
import {useDrag,useDrop} from "react-dnd"
import { TestCase } from "../models/TestCase"
import { DragItem } from "../definitions/types"


const SingleTestComponent: React.FC<{test:SingleTest}> = (props) => {

    const context = useContext(HandlersContext)
    
    const [{isDragging},dragRef, dragPreview] = useDrag({
        item:{
            type:typeof TestCase, 
            id:props.test.id
        },
        collect: monitor => ({
          isDragging: !!monitor.isDragging()
        })
    })
    const [{ isOver, canDrop }, dropRef] = useDrop({
        accept:[typeof TestCase],
        drop: (item:DragItem,monitor) => {
            // console.log("SingleTest.drop",item.id,"into",props.test.id)
            if(monitor.didDrop()) return; //Checking if an earlier node caught it
            // console.log("Drop uncaught so far, calling context")
            if(monitor.canDrop()) {
                context.onDragDrop(item.id,props.test.id)
            }
        },
        //No restrictions on singles, but groups cannot be dropped on a child item
        canDrop: (item:DragItem) => {
            //return item.id !== props.test.id && item.parentId !== props.test.id
            return context.checkCanDrop(item.id , props.test.id)
        },
        collect: mon => ({
          isOver: !!mon.isOver({shallow:true}),
          canDrop: !!mon.canDrop(),
        })
    })

    return (
    <div className={"single" + (isOver?" hovered":"") + (canDrop?" canDrop":" noDrop") + (isDragging?" dragging":"") } ref={dropRef}>
      <div className="line" ref={dragPreview}>
        
        <input className="handle" ref={dragRef} readOnly value={`${props.test.getPercent()}%`} style={{backgroundColor:COLOR_ZERO.interpolateWith(COLOR_HUND,props.test.hits/props.test.tries).toCSS()}} />
        <input value={props.test.target} className="fill" onChange={(e) => context.onChangeSingleTarget(props.test.id,e.target.value)} placeholder="Target Card" />
        {/* https://react-select.com/ maybe? */}
        <select value={props.test.compare} onChange={(e) => context.onChangeSingleCompare(props.test.id,e.target.value as CompareType)}>
          <option value={CompareType.GT}>&ge;</option>
          <option value={CompareType.EQ}>=</option>
          <option value={CompareType.LT}>&le;</option>
        </select>
        <input type="number" value={props.test.amount} onChange={(e) => context.onChangeSingleAmount(props.test.id,Number.parseInt(e.target.value))}/>
        <input readOnly disabled value="by T" />
        <input type="number" value={props.test.turn} onChange={(e) => context.onChangeTestTurn(props.test.id,Number.parseInt(e.target.value))}/>
      </div>
    </div>
    )
  }

  export default SingleTestComponent