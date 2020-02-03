import {TestCase} from '../models/TestCase';
import { Card } from './Card';
import { MatchType, CompareType, TestType } from '../definitions/enums';
import {INITIAL_DRAW} from '../definitions/constants'
export class SingleTest extends TestCase {
    
  public turn: number = 1;
  public match: MatchType = MatchType.Name;
  public compareCards: CompareType = CompareType.GT;
  public compareTarget: CompareType = CompareType.EQ;
  public amount: number = 1;
  constructor(readonly id: number, public target: string) {
    super(id, TestType.Single);
  }
  clone(): TestCase {
    let clone = new SingleTest(this.id, this.target)
    Object.assign(clone,this)
    return clone;
  }
  public toString() {
    let str:string = "Draw "
    switch (this.compareCards) {
      case CompareType.EQ:
        str += "exactly"
        break;
      case CompareType.GT:
        str += "at least"
        break;
      case CompareType.LT:
        str += "at most"
        break;
    }

    str += " " + this.amount + " cards with " + this.match + " " + this.compareTarget + " " + this.target
    str += " by turn " + this.turn

    return str;
  }
  protected runTest(deck: Array<Card>): boolean {
    //let result = 10 * Math.random() > this.id
    // console.log("Single ID",this.id,result)
    let hand = deck.slice(0, INITIAL_DRAW + this.turn);
    let result: boolean = false;
    let matches: number = 0;
    let targetN = Number.parseInt(this.target)

    let selectorS:(c:Card)=>string = (c) => "";
    let comparerS:(s:string)=>Boolean = (s) => false
    let selectorN:(c:Card)=>number = (c) => NaN;
    let comparerN:(n:number)=>Boolean = (n) => false
    let testVal:"string"|"number"

    switch (this.match) {
      case MatchType.Name:
        selectorS = (c:Card)=> c.name
        testVal = "string"
        break;
      case MatchType.CMC:
        selectorN = (c:Card) => c.cmc
        testVal = "number"
        break;
      case MatchType.CardType:
        selectorS = (c:Card)=> c.cardType
        testVal = "string"
        break;
      case MatchType.Power:
        selectorN = (c:Card) => c.power
        testVal = "number"
        break;
      case MatchType.Toughness:
        selectorN = (c:Card) => c.toughness
        testVal = "number"
        break;
    }

    switch (this.compareTarget) {
      case CompareType.EQ:
        comparerS = (s:string) => s.includes(this.target)
        comparerN = (n:number) => n === targetN
      break;
      case CompareType.NE:
        comparerS = (s:string) => !s.includes(this.target)
        comparerN = (n:number) => n !== targetN
      break;
      case CompareType.GT:
        comparerN = (n:number) => n >= targetN
      break;
      case CompareType.LT:
        comparerN = (n:number) => n <= targetN
      break;
    }

    if(testVal === "number")
    {
      matches = hand.map(selectorN).filter(comparerN).length;
    }
    else if(testVal === "string")
    {
      matches = hand.map(selectorS).filter(comparerS).length;
    }

    switch (this.compareCards) {
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
