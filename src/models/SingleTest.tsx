import {TestCase} from '../models/TestCase';
import { Card } from './Card';
import { MatchType, CompareType, TestType } from '../definitions/enums';
import {INITIAL_DRAW} from '../definitions/constants'
export class SingleTest extends TestCase {
    
  public turn: number = 1;
  public match: MatchType = MatchType.Name;
  public compare: CompareType = CompareType.GT;
  public amount: number = 1;
  constructor(readonly id: number, public target: string) {
    super(id, TestType.Single);
  }
  clone(): TestCase {
    let clone = new SingleTest(this.id, this.target)
    clone.parentId = this.parentId
    clone.turn = this.turn
    clone.match = this.match
    clone.compare = this.compare
    clone.amount = this.amount
    return clone;
  }
  public toString() {
    switch (this.compare) {
      case CompareType.EQ:
        return `${this.amount} ${this.target} by T${this.turn}`;
      case CompareType.GT:
        return `${this.amount}+ ${this.target} by T${this.turn}`;
      case CompareType.LT:
        return `${this.amount}- ${this.target} by T${this.turn}`;
    }
  }
  protected runTest(deck: Array<Card>): boolean {
    //let result = 10 * Math.random() > this.id
    // console.log("Single ID",this.id,result)
    let hand = deck.slice(0, INITIAL_DRAW + this.turn);
    let result: boolean = false;
    let matches: number = 0;
    switch (this.match) {
      case MatchType.Name:
        matches = hand.filter(c => c.name.includes(this.target)).length;
        break;
    }
    switch (this.compare) {
      case CompareType.EQ:
        result = matches === this.amount;
        break;
      case CompareType.GT:
        result = matches >= this.amount;
        break;
      case CompareType.LT:
        result = matches <= this.amount;
        break;
    }
    return result;
  }
}
