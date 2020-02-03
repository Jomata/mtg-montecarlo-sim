import { SingleTest } from "../models/SingleTest"
import React, { useContext } from "react"
import { CompareType, MatchType } from "../definitions/enums"
import { COLOR_ZERO, COLOR_HUND, HandlersContext } from "../definitions/constants"
import {useDrag,useDrop} from "react-dnd"
import { TestCase } from "../models/TestCase"
import { DragItem } from "../definitions/types"
import { Card } from "../models/Card"
import _ from "lodash"


const SingleTestComponent: React.FC<{test:SingleTest, cards:Array<Card>}> = (props) => {

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
    
    const opts_cardNames = props.cards.map(card => card.name).sort().map(val => {return {value:MatchType.Name+":"+val,text:val}})
    const opts_cardTypes = _.uniq(props.cards.flatMap(c => c.cardType?.split(/[\s/\W]+/)).filter(w => w !== undefined).map(w => w as string)).map(val => {return {value:MatchType.CardType+":"+val,text:val}})
    const opts_CMC = _.uniq(props.cards.map(c => c.cmc)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:MatchType.CMC+":"+val,text:`CMC = ${val}`}})
    const opts_Power = _.uniq(props.cards.map(c => c.power)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:MatchType.Power+":"+val,text:`Power = ${val}`}})
    const opts_Toughness = _.uniq(props.cards.map(c => c.toughness)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:MatchType.Toughness+":"+val,text:`Toughness = ${val}`}})
    const selectedValue = props.test.match+":"+props.test.target

    return (
    <div className={"single" + (isOver?" hovered":"") + (canDrop?" canDrop":" noDrop") + (isDragging?" dragging":"") } ref={dropRef}>
      <div className="line" ref={dragPreview}>
        
        <input className="handle" ref={dragRef} readOnly value={`${props.test.getPercent()}%`} style={{backgroundColor:COLOR_ZERO.interpolateWith(COLOR_HUND,props.test.hits/props.test.tries).toCSS()}} />
        
        <select value={selectedValue} className="fill" onChange={(e) => {
          const [match,value] = e.target.value.split(":")
          const mType: MatchType = match as MatchType;
          // console.log(match,"==>",mType)
          context.onChangeSingleTarget(props.test.id,value, mType )
        }} >
          <option defaultChecked>Select a condition...</option>
          <optgroup label="Cards with name...">
          {opts_cardNames.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
          </optgroup>
          <optgroup label="Cards with type...">
          {opts_cardTypes.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
          </optgroup>
          <optgroup label="Cards with CMC...">
          {opts_CMC.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
          </optgroup>
          <optgroup label="Cards with Power...">
          {opts_Power.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
          </optgroup>
          <optgroup label="Cards with Toughness...">
          {opts_Toughness.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
          </optgroup>
        </select>
        {/* <input value={props.test.target} className="fill" onChange={(e) => context.onChangeSingleTarget(props.test.id,e.target.value)} placeholder="Target Card" /> */}


        {/* https://react-select.com/ maybe? */}
        <select value={props.test.compareCards} onChange={(e) => context.onChangeSingleCompare(props.test.id,e.target.value as CompareType)}>
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