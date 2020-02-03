import { SingleTest } from "../models/SingleTest"
import React, { useContext, useState, useEffect } from "react"
import { CompareType, MatchType } from "../definitions/enums"
import { COLOR_ZERO, COLOR_HUND, HandlersContext } from "../definitions/constants"
import {useDrag,useDrop} from "react-dnd"
import { TestCase } from "../models/TestCase"
import { DragItem } from "../definitions/types"
import { Card } from "../models/Card"
import _ from "lodash"


const SingleTestComponentVerbose: React.FC<{test:SingleTest, cards:Array<Card>}> = (props) => {

    const context = useContext(HandlersContext)
    const [selectedMatch,setMatch] = useState(props.test.match)
    const [selectedTarget,setTarget] = useState(props.test.target)
    useEffect(() => {
      // console.log("SingleTestComponent.useEffect")
      context.onChangeSingleTarget(props.test.id,selectedTarget,selectedMatch )
    }, [selectedMatch,selectedTarget])
    
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
    
    const opts_cardNames = props.cards.map(card => card.name).sort().map(val => {return {value:val,text:val}})
    const opts_cardTypes = _.uniq(props.cards.flatMap(c => c.cardType?.split(/[\s/\W]+/)).filter(w => w !== undefined).map(w => w as string)).map(val => {return {value:val,text:val}})
    const opts_CMC = _.uniq(props.cards.map(c => c.cmc)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:val.toString(),text:`${val}`}})
    const opts_Power = _.uniq(props.cards.map(c => c.power)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:val.toString(),text:`${val}`}})
    const opts_Toughness = _.uniq(props.cards.map(c => c.toughness)).filter(val => val !== null && val !== undefined).sort().map(val => {return {value:val.toString(),text:`${val}`}})
    let validOptions:Array<{value:string,text:string}> = [];
    switch (props.test.match) {
      case MatchType.Name:
        validOptions = opts_cardNames
        break;
      case MatchType.CardType:
        validOptions = opts_cardTypes
        break;
      case MatchType.CMC:
        validOptions = opts_CMC
        break;
      case MatchType.Power:
        validOptions = opts_Power
        break;
      case MatchType.Toughness:
      validOptions = opts_Toughness
        break;
    }

    let targetCompareOptions:Array<{value:string,text:string}> = []
    if (props.test.match === MatchType.Name || props.test.match === MatchType.CardType) 
    {
      targetCompareOptions = [{value:CompareType.EQ,text:"being"},{value:CompareType.NE,text:"not"}]
    } else {
      targetCompareOptions = [{value:CompareType.EQ,text:"exactly"},{value:CompareType.NE,text:"not"},{value:CompareType.GT,text:"at least"},{value:CompareType.LT,text:"at most"}]
    }

    return (
    <div className={"single" + (isOver?" hovered":"") + (canDrop?" canDrop":" noDrop") + (isDragging?" dragging":"") } ref={dropRef}>
      <div className="line verbose" ref={dragPreview}>
        
        <input className="handle" ref={dragRef} readOnly value={`${props.test.getPercent()}%`} style={{backgroundColor:COLOR_ZERO.interpolateWith(COLOR_HUND,props.test.hits/props.test.tries).toCSS()}} />
        
        <input value="Draw" readOnly disabled />
        <select value={props.test.compareCards} onChange={(e) => context.onChangeSingleCompare(props.test.id,e.target.value as CompareType)}>
          <option value={CompareType.GT}>at least</option>
          <option value={CompareType.EQ}>exactly</option>
          <option value={CompareType.LT}>at most</option>
        </select>

        <select value={props.test.amount} onChange={(e) => context.onChangeSingleAmount(props.test.id,Number.parseInt(e.target.value))}>
          {[0,1,2,3,4,5,6,7,8,9].map(i => <option key={"amount_"+i} value={i}>{i}</option>)}
        </select>

        <input value={"card"+(props.test.amount!==1?"s":"")} readOnly disabled />
        <select value={props.test.match} onChange={e => setMatch(e.target.value as MatchType)}>
          <option value={MatchType.Name}>with name</option>
          <option value={MatchType.CardType}>with type</option>
          <option value={MatchType.CMC}>with CMC</option>
          <option value={MatchType.Power}>with Power</option>
          <option value={MatchType.Toughness}>with Toughness</option>
        </select>

        <select value={props.test.compareTarget} onChange={e => context.onChangeSingleCompareTarget(props.test.id, e.target.value as CompareType)}>
          {targetCompareOptions.map(o => <option key={o.value} value={o.value}>{o.text}</option>)}
        </select>

        <select value={props.test.target} className="fill" onChange={e => {setTarget(e.target.value)}}>
          {validOptions.map(val => <option value={val.value} key={val.value}>{val.text}</option> )}
        </select>

        <input readOnly disabled value="by turn" />

        <select value={props.test.turn} onChange={(e) => context.onChangeTestTurn(props.test.id,Number.parseInt(e.target.value))}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => <option key={"turn_"+i} value={i}>{i}</option>)}
        </select>
      </div>
    </div>
    )
  }

  export default SingleTestComponentVerbose