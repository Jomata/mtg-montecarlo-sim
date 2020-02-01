import {TestCase} from '../models/TestCase';
import { Card } from './Card';
import { GroupType, TestType } from '../definitions/enums';
///Idea: The Group test could also have a target amount & comparison type, so you can check that out of your sub-tests, you get >0, exactly 1, >1, etc.
export class GroupTest extends TestCase {
//   public getChildren: Array<TestCase> = [];
  public groupType: GroupType = GroupType.ALL;
  public name?: string;
  constructor(readonly id: number) {
    super(id, TestType.Group);
  }
  clone(): TestCase {
      let clone = new GroupTest(this.id)
      clone.parentId = this.parentId
//   clone.children = this.children.map(c => c.clone())
      clone.groupType = this.groupType
      clone.name = this.name
      return clone
  }
  public getChildren(TestSuite:Array<TestCase>):Array<TestCase> {
    return TestSuite.filter(t => t.parentId === this.id);
  }

  public toString() {
    if (this.name !== undefined) {
      return `${this.name} [${this.groupType}]`;
    }
    else {
      return `Group ${this.id} [${this.groupType}]`;
    }
  }
  protected runTest(deck: Array<Card>, allTests:Array<TestCase>): boolean {
    let childrenResults = this.getChildren(allTests).map(c => c.IsTrue(deck, allTests));
    var result: boolean;
    if (this.groupType === GroupType.ANY) {
      result = childrenResults.some(r => r);
    }
    else {
      result = childrenResults.every(r => r);
    }
    // console.log("Group ID",this.id,result)
    return result;
  }

  public getAllDescendants(TestSuite:Array<TestCase>): Array<TestCase> {
    const myChildren = this.getChildren(TestSuite);
    const groupChildren = myChildren.flatMap(c => {
        if(c instanceof GroupTest)
            return [c as GroupTest]
        else return []
    })
    const grandChildren = groupChildren.flatMap(ch => ch.getAllDescendants(TestSuite))

    return [...myChildren,...grandChildren]
  } 
}
