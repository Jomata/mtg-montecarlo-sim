import _ from "lodash";
import * as scryfall  from "scryfall";
import { LocalStorage } from "../utils/LocalStorage";

export class Card {
  /* parsed from arena export */
  public cardSet?:string
  public cardNumber?:number

  /* Scryfall data */
  public cmc?:number;
  public cardType?:string;
  public power?:number;
  public toughness?:number;
  public oracleText?:string;
  public manaCost?:string;

  public getLSKey():string 
  {
    return "Card|" + this.name;
  }

  constructor(public name: string) { }

  private static readonly cardRegEx = /([0-9]+)[\s]+([\S\s]+)[\s]+\(([\S]{3})\)[\s]+([0-9]+)/
  //EJ: 32 Mountain (M20) 276
  static parseLine(cardStr:string):[number,Card|null] {
    let matches = cardStr.trim().match(Card.cardRegEx)
    if (matches === undefined || matches === null) {
      return [0,null];
    }
    else {
      let m = matches as RegExpMatchArray
      if (m.length === 5) {
        let copies = Number.parseInt(m[1])
        let card = new Card(m[2])
        card.cardSet = m[3]
        card.cardNumber = Number.parseInt(m[4])
        return [copies,card];
        //return new Array<Card>(copies).fill(card)
      }
      else {
        return [0,null]
      }
    }
  }

  static parseDeck(deckString:string):Array<Card> {
    let lines = deckString.split('\n')
    return lines.flatMap(s => {
      let [n,c] = Card.parseLine(s)
      if(c instanceof Card) return new Array<Card>(n).fill(c)
      else return []
    })
  }

  //try and load the info from the cache, if we can't, then load the scryfall library
  //for now just using scryfall
  static getCardInfo():void {

  }

  static fetchCardInfo(card:Card):void {
    
  }

  static prefetchDeck(deckStr:string):void {
    // console.log("Card.prefetchDeck")
    let cards = _.uniqBy( this.parseDeck(deckStr), c => c.name )
    cards.forEach(c => {
      let cacheCard = LocalStorage.LoadT(c.getLSKey(), Card.fromJSON)
      if(cacheCard == null) {
        // console.log("Fetching",c.name,"data from scryfall")
        scryfall.getCardByName(c.name, true).then(res => {
          // console.log("fetched data for",c.name)
          c.cardType = res.type_line
          c.cmc = res.cmc
          c.manaCost = res.mana_cost
          c.power = res.power?Number.parseInt(res.power):undefined
          c.toughness = res.toughness?Number.parseInt(res.toughness):undefined
          c.oracleText = res.oracle_text
          // console.log("response to",c,"->",res)
          LocalStorage.SaveT(c.getLSKey(),c,Card.toJSON)

        }).catch(err => {
          console.log("error fetching",c,"->",err)
        })
      } else {
        // console.log("Cached data for",c.name,"is",cacheCard)
      }
    })
  }

  static toJSON(card:Card):string 
  {
    return JSON.stringify(card);
  }

  static fromJSON(json:string):Card
  {
    const fakeCard = JSON.parse(json) as Card
    let realCard = new Card(fakeCard.name)
    Object.assign(realCard,fakeCard)
    return realCard;
  }
}
