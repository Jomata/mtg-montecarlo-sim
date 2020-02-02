import { GroupTest } from "../models/GroupTest"
import React, { useContext } from "react"
import TestComponent from "./TestComponent"
import { GroupType } from "../definitions/enums"
import { COLOR_ZERO, COLOR_HUND, HandlersContext } from "../definitions/constants"
import { TestCase } from "../models/TestCase"
import { DragItem } from "../definitions/types"
import { useDrag, useDrop } from "react-dnd"
import { Card } from "../models/Card"

const GroupTestComponent: React.FC<{test:GroupTest, allTests:Array<TestCase>, cards:Array<Card>}> = (props) => {

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
      <div className={"group"+ (isOver?" hovered":"")+ (canDrop?" canDrop":" noDrop")+ (isDragging?" dragging":"") } ref={dropRef}>
        <div className="line groupHeader" ref={dragPreview}>
          <input className="handle" ref={dragRef} readOnly value={`${props.test.getPercent()}%`}  style={{backgroundColor:COLOR_ZERO.interpolateWith(COLOR_HUND,props.test.hits/props.test.tries).toCSS()}} />
          <input className="fill" value={props.test.name} onChange={(e) => context.onChangeGroupName(props.test.id,e.target.value)} placeholder="Group Name" />
          <input readOnly disabled value="for" />
          <select value={props.test.groupType} onChange={(e) => context.onChangeGroupType(props.test.id,e.target.value as GroupType)} >
            <option value={GroupType.ALL}>ALL</option>
            <option value={GroupType.ANY}>ANY</option>
          </select>
          <input readOnly disabled value="of:" />
        </div>
        <div className="children">
        {props.test.getChildren(props.allTests).sort((a,b)=>a.id-b.id).map(ct => <TestComponent key={ct.id+"_cmp"} test={ct} allTests={props.allTests} cards={props.cards} />)}
        </div>
      </div>
    )
  }

  export default GroupTestComponent