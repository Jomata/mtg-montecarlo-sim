import { GroupTest } from "../models/GroupTest"
import React from "react"
import { TestCase } from "../models/TestCase"
import { SingleTest } from "../models/SingleTest"
import GroupTestComponent from "./GroupTestComponent"
import SingleTestComponent from "./SingleTestComponent"
import { Card } from "../models/Card"

const TestComponent:React.FC<{test:TestCase, allTests:Array<TestCase>, cards:Array<Card>}> = (props) => {
    if(props.test instanceof GroupTest) 
      return <GroupTestComponent test={props.test} allTests={props.allTests} cards={props.cards} />
    else if(props.test instanceof SingleTest) 
      return <SingleTestComponent test={props.test} cards={props.cards} />
    else return <div />
  }

  export default TestComponent