import React, { useState, useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import _ from 'lodash'; //Only using it for _.shuffle
import {TestCase } from './models/TestCase';
import {Tests2JSON, JSON2Tests} from './definitions/utils';
import { Card } from './models/Card';
import { GroupTest } from './models/GroupTest';
import { SingleTest } from './models/SingleTest';
import TestComponent from './components/TestComponent';
import {TOTAL_RUNS, HandlersContext} from './definitions/constants'
import { TestType, GroupType, CompareType } from './definitions/enums';
import { DndProvider } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import TrashcanComponent from './components/TrashcanComponent';
import useLocalStorage from './useLocalStorage'

const deckString = `28 Mountain (M20) 276
4 Terror of Mount Velus (THB) 295
4 Purphoros, Bronze-Blooded (THB) 150
4 Ilharg, the Raze-Boar (WAR) 133
4 Cavalier of Flame (M20) 125
4 Storm's Wrath (THB) 157
4 Fires of Invention (ELD) 125
4 Bonecrusher Giant (ELD) 115
4 Drakuseth, Maw of Flames (M20) 136`

const json = [
  { id: 6, type: TestType.Group, parent: 15, name: "Curve" },
  { id: 1, type: TestType.Single, target: "Mountain", parent: 6, amount: 1, turn: 1, compare: CompareType.GT },
  { id: 2, type: TestType.Single, target: "Mountain", parent: 6, amount: 2, turn: 2, compare: CompareType.GT },
  { id: 3, type: TestType.Single, target: "Mountain", parent: 6, amount: 3, turn: 3, compare: CompareType.GT },
  { id: 4, type: TestType.Single, target: "Mountain", parent: 6, amount: 4, turn: 4, compare: CompareType.GT },
  { id: 5, type: TestType.Single, target: "Mountain", parent: 6, amount: 5, turn: 5, compare: CompareType.GT },
  { id: 14, type: TestType.Group, group: GroupType.ALL, parent: 15, name: "Combo Pieces" },
  { id: 7, type: TestType.Single, turn: 4, target: "Fires of Invention", parent: 14 },
  { id: 8, type: TestType.Single, turn: 5, target: "Purphoros", parent: 14 },
  { id: 9, type: TestType.Single, turn: 5, target: "Cavalier of Flame", parent: 14 },
  { id: 10, type: TestType.Group, group: GroupType.ANY, parent: 14, name: "Any 1 extra" },
  { id: 11, type: TestType.Single, turn: 5, target: "Terror", parent: 10 },
  { id: 12, type: TestType.Single, turn: 5, target: "Drakuseth", parent: 10 },
  { id: 13, type: TestType.Single, turn: 5, target: "Ilharg", parent: 10 },
  { id: 15, type: TestType.Group, group: GroupType.ALL, parent: null, name: "Magical Xmas Land" },
]

let defaultTests: Array<TestCase> = json.map(o => {
  if (o.type === TestType.Group) {

    let test = new GroupTest(o.id)
    if (typeof o.parent === "number")
      test.parentId = o.parent as number;
    if (o.group !== undefined)
      test.groupType = o.group as GroupType

    test.name = o.name;

    return test;
  } else {
    let test = new SingleTest(o.id, o.target as string)

    if (typeof o.parent === "number")
      test.parentId = o.parent as number;
    if (o.amount !== undefined)
      test.amount = o.amount as number;
    if (o.turn !== undefined)
      test.turn = o.turn as number;
    if (o.compare !== undefined)
      test.compare = o.compare as CompareType;

    return test;
  }
})

const App: React.FC = () => {

  // console.log("Main App initializing")
  const [persistedDeck, persistDeck] = useLocalStorage("deck",deckString)
  const [persistedTests, persistTests] = useLocalStorage("tests",Tests2JSON(defaultTests))

  const [stateDeck, setDeck] = useState(persistedDeck)
  const [stateTests,setTests] = useState(JSON2Tests(persistedTests))
  const [running,setRunning] = useState(false)
  const [numOfRuns,setRuns] = useState(TOTAL_RUNS)
  const [saved, setSaved] = useState(true)

  console.log(defaultTests , Tests2JSON(defaultTests))
  let roundTrip = JSON2Tests(Tests2JSON(stateTests))
  console.log(roundTrip)

  // useEffect is causing the initial render to happen twice
  // there's a setState somewhere after this that shouldn't be there
  useEffect(()=>{
      setSaved(false)
  }, [stateTests,stateDeck])

  function updateTest(id:number, transform:(test:TestCase) => void)
  {
    setTests(tests => tests.map(t => {
      if(t.id === id)  transform(t); 
      return t;
      }))
  }
  function updateSingleTest(id:number, transform:(test:SingleTest) => void)
  {
    setTests(tests => tests.map(t => {
      if(t.id === id && t instanceof SingleTest) transform(t); 
      return t;
      }))
  }
  function updateGroupTest(id:number, transform:(test:GroupTest) => void)
  {
    setTests(tests => tests.map(t => {
      if(t.id === id && t instanceof GroupTest) transform(t); 
      return t;
      }))
  }

  const onChangeTestTurn = (id:number,turn:number) => updateSingleTest(id, t => t.turn = turn)
  const onChangeSingleTarget = (id:number,target:string) => updateSingleTest(id, t => t.target = target)
  const onChangeGroupName = (id:number,name:string) => updateGroupTest(id, t => t.name = name)
  const onChangeGroupType = (id:number,group:GroupType) => updateGroupTest(id, t => t.groupType = group)
  const onChangeSingleCompare = (id:number,compare:CompareType) => updateSingleTest(id,t => t.compare = compare)
  const onChangeSingleAmount = (id:number,amount:number) => updateSingleTest(id, t => t.amount = amount)
  const checkCanDrop = (draggedTestId:number,droppedOnTestId:number) => {
    if(draggedTestId === droppedOnTestId) {
      return false;
    }

    const draggedTest = stateTests.find(t => t.id === draggedTestId)
    const droppedOnTest = stateTests.find(t => t.id === droppedOnTestId)
    if(draggedTest instanceof TestCase && droppedOnTest instanceof TestCase)
    {
      if(draggedTest.parentId !== undefined && draggedTest.parentId === droppedOnTest.id) {
        return false;
      }

      //If dragged and dropped are the only children of the same parent, we would create an identical group, so no need
      if(draggedTest.parentId !== undefined && draggedTest.parentId === droppedOnTest.parentId) {
        let parentTest = stateTests.find(t => t.id === draggedTest.parentId)
        if(parentTest instanceof GroupTest && parentTest.getChildren.length === 2)
          return false;
      }

      //if the dragged test is a Group, we need to check we don't drop him inside one of his children
      if(draggedTest instanceof GroupTest)
      {
        const descendants = draggedTest.getAllDescendants(stateTests);
        if(descendants.some(d => d.id === droppedOnTestId)) {
          return false;
        }
      }

      return true;
    }
    else
    {
      return false;
    }
  }
  const onDragDrop = (draggedTestId:number,droppedOnTestId:number) => {
    //Invalid drops are being dropped into the element immediatly above, which I believe is the first valid drop target
    console.log("Handlers","Dropped",draggedTestId,"into",droppedOnTestId)
    if(checkCanDrop(draggedTestId,droppedOnTestId) === false) {
      console.log("Invalid drop")
      return;
    }

    // console.log("App.onDragDrop",draggedTestId,droppedOnTestId)
    const draggedTest = stateTests.find(t => t.id === draggedTestId)
    const droppedOnTest = stateTests.find(t => t.id === droppedOnTestId)
    if(draggedTest instanceof TestCase && droppedOnTest instanceof TestCase)
    {
      //In both scenarios, the dragged test has a new parent
      if(draggedTest.parentId !== undefined) {
        let draggedTestParent = stateTests.find(t => t.id === draggedTest.parentId)
        if(draggedTestParent instanceof GroupTest) {
          if(draggedTestParent.getChildren(stateTests).length === 1) { //If it was the only child, we remove the parent from the list
            setTests(prevTests => prevTests.filter(t => t.id !== draggedTest.parentId))
          } 
        }
      }

      //Case A: Drop Single/Group on Single => Create a group (with parent = droppedOn.parent), and set both single tests parent to the new group
      if(droppedOnTest instanceof SingleTest)
      {
        const newGroup = new GroupTest(1 + Math.max(...stateTests.map(t => t.id)) )
        
        newGroup.parentId = droppedOnTest.parentId
        setTests(prevTests => [...prevTests,newGroup])
        updateTest(draggedTestId, t => t.parentId = newGroup.id)
        updateTest(droppedOnTestId, t => t.parentId = newGroup.id)
      }

      //Case B: Drop Single/Group on Group => Set the parent for the dragged item to the dropped's ID
      if(droppedOnTest instanceof GroupTest)
      {
        updateTest(draggedTestId, t => t.parentId = droppedOnTest.id)
      }
    }
  }

  const onTrashDrop = (id:number) => {
    //deleting the whole thing if it's a group, there are arguments for deleting just the wrapper and ungrouping the children
    const deletedTest = stateTests.find(t => t.id === id)
    if(deletedTest instanceof SingleTest) {
      setTests(prevTests => prevTests.filter(t => t.id !== deletedTest.id))
    }
    else if(deletedTest instanceof GroupTest) {
      const allChildrenIDs = deletedTest.getAllDescendants(stateTests).map(t => t.id)
      const allDeletedIDs = [deletedTest.id, ...allChildrenIDs]
      setTests(prevTests => prevTests.filter(t => allDeletedIDs.includes(t.id) === false ))
    }
  }

  const handlers = {
    onChangeTestTurn:onChangeTestTurn,
    onChangeSingleTarget:onChangeSingleTarget,
    onChangeGroupName:onChangeGroupName,
    onChangeGroupType:onChangeGroupType,
    onChangeSingleCompare:onChangeSingleCompare,
    onChangeSingleAmount:onChangeSingleAmount,
    onDragDrop:onDragDrop,
    checkCanDrop:checkCanDrop
  }
  function handleClickAdd() {
    setTests(prevTests => [...prevTests, new SingleTest(1 + Math.max(0, ...prevTests.map(t => t.id)), "")])
  }
  function handleClickRun() {
    runSim();
  }
  function handleSave() {
    persistDeck(stateDeck)
    persistTests(Tests2JSON(stateTests))
    setSaved(true)
  }

  function getRootTests() {
    return stateTests.filter(t => t.parentId == null)
  }

  function runSim() {
    setRunning(true)
    let newTests = TestCase.clone(stateTests)

    let rootTests: Array<TestCase> = newTests.filter(t => t.parentId == null) 
    let deck = Card.parseText(stateDeck)
    for (let i = 0; i < TOTAL_RUNS; i++) {
      let shuffled = _.shuffle(deck);
      rootTests.forEach(t => t.IsTrue(shuffled, newTests))
    }

    setTests(newTests)
    setRunning(false)
  }

  //Handle the deck just as a big string for the app, and only parse it as a deck when we click run
  //we can try and pre-fetch the card info in the background maybe?

  //https://blog.axlight.com/posts/how-i-developed-react-hooks-for-web-workers/
  //To run the sim as a background process

  return (
    <div className="App" style={{ "textAlign": "left" }}>
      <div className="header" />
      <div className="content">
        <div  id="deck">
          <div className="actions line">
          <button className="left fill run" onClick={handleClickRun} disabled={running} >RUN</button>
          <input type="number" value={numOfRuns} onChange={e => setRuns(Number.parseInt(e.target.value))} />
          <button className="right fill run" onClick={handleClickRun} disabled={running} >times</button>
          <div className="horizontalSpacer" />
          <button className="add fill" onClick={handleClickAdd}>Add Condition</button>
          </div>
          
          <em>Deck</em>
          <textarea value={stateDeck} onChange={e => setDeck(e.target.value)} />
          <div className="line">
            <button id="save" disabled={saved} onClick={handleSave}>Save</button>
             <DndProvider backend={MultiBackend} options={HTML5toTouch}>
             <TrashcanComponent dropHandler={onTrashDrop} />
             </DndProvider>
          </div>
        </div>
        
        <HandlersContext.Provider value={handlers}>
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <div id="tests">
          {getRootTests().sort((a,b) => a.id - b.id).map(t => <TestComponent key={t.id + "_tst"} test={t} allTests={stateTests} />)}
        </div>
        </DndProvider>
        </HandlersContext.Provider>
        
      </div>
      <div className="footer" />
    </div>
  );
}
export default App;
