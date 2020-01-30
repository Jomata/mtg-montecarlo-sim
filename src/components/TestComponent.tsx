import { GroupTest } from "../models/GroupTest"
import React from "react"
import { TestCase } from "../models/TestCase"
import { SingleTest } from "../models/SingleTest"
import GroupTestComponent from "./GroupTestComponent"
import SingleTestComponent from "./SingleTestComponent"

const TestComponent:React.FC<{test:TestCase, allTests:Array<TestCase>}> = (props) => {
    if(props.test instanceof GroupTest) 
      return <GroupTestComponent test={props.test} allTests={props.allTests}  />
    else if(props.test instanceof SingleTest) 
      return <SingleTestComponent test={props.test}  />
    else return <div />
  }

  export default TestComponent