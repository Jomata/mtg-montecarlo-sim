import { TestCase } from "../models/TestCase";
import { SingleTest } from "../models/SingleTest";
import { TestType } from "./enums";
import { GroupTest } from "../models/GroupTest";

export function Tests2JSON(tests:Array<TestCase>):string
  {
    return JSON.stringify(tests)
  }

export function JSON2Tests(json:string):Array<TestCase>
  {
      //JSON.parse returns _objects_ with the same properties as the classes we want
      //So we need to transform those objets to actual class instances
      let pseudoTests:Array<TestCase> = JSON.parse(json);
      let realTests:Array<TestCase> = pseudoTests.flatMap(pt => {
          let newTest:TestCase
          if(pt.testType === TestType.Single) {
              newTest = new SingleTest(pt.id,"")
          } else if (pt.testType === TestType.Group) {
              newTest = new GroupTest(pt.id)
          } else {
              return []
          }

          Object.assign(newTest,pt)
          return [newTest];
      })
      
    return realTests
  }