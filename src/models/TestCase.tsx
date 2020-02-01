import { TestType } from '../definitions/enums';
import { Card } from "./Card";

export abstract class TestCase {
  public hits: number = 0;
  public tries: number = 0;
  public parentId?: number;
  constructor(public readonly id: number, public readonly testType: TestType) {
  }
  protected abstract runTest(deck: ReadonlyArray<Card>, allTests:ReadonlyArray<TestCase>): boolean;
  public IsTrue(deck: ReadonlyArray<Card>, allTests:ReadonlyArray<TestCase>): boolean {
    let result = this.runTest(deck, allTests);
    // console.log("Test ID",this.id,"is at",this.hits,"/",this.tries)
    if (result)
      this.hits++;
    this.tries++;
    // console.log("Test ID",this.id,"is at",this.hits,"/",this.tries)
    return result;
  }
  public getPercent(): string {
    if(this.tries > 0)
        return (100 * this.hits / this.tries).toFixed(1);
    else
        return "??"
  }
  abstract clone():TestCase;
  
  public static clone(tests:ReadonlyArray<TestCase>):Array<TestCase>
  {
      let clones = tests.map(t => t.clone())
      return clones;
  }
}