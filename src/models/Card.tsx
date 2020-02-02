import _ from "lodash";
import * as scryfall  from "scryfall";
import { LocalStorage } from "../utils/LocalStorage";

export class Card {
  /* parsed from arena export */
  public cardSet?:string
  public cardNumber?:number

  /* Scryfall data */
  public cmc:number = Number.NaN;
  public cardType:string = "";
  public power:number = Number.NaN;
  public toughness:number = Number.NaN;
  public oracleText:string = "";
  public manaCost:string = "";

  public getLSKey():string 
  {
    return "Card|" + this.name;
  }

  constructor(public name: string) { }

  private static readonly cardRegEx = /([0-9]+)\s?([^(]+)\s?(\([A-Z]{3}\))?\s?([0-9]+)?/
  //EJ: 32 Mountain (M20) 276
  static parseLine(cardStr:string):[number,Card|null] {
    let matches = cardStr.trim().match(Card.cardRegEx)
    if (matches === undefined || matches === null) {
      return [0,null];
    }
    else {
      let m = matches as RegExpMatchArray
      if (m.length > 2) { //I only really need amount + name, set+code are just bonus
        let copies = Number.parseInt(m[1])
        let card = new Card(m[2].trim())
        if(m.length > 3 && m[3] !== undefined) card.cardSet = m[3].replace("(","").replace(")","")
        if(m.length > 4 && m[4] !== undefined) card.cardNumber = Number.parseInt(m[4])
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

  static fetchCardInfo(c:Card):Promise<Card> {
    return new Promise<Card>((resolve, reject) => {
      
      let cacheCard = LocalStorage.LoadT(c.getLSKey(), Card.fromJSON)
      if(cacheCard == null) {
        // console.log("Fetching",c.name,"data from scryfall")
        scryfall.getCardByName(c.name, true).then(res => {
          //  console.log("fetched data for",c.name,res)
          let newCard = new Card(res.name)
          newCard.cardSet = res.set.toUpperCase()
          newCard.cardNumber = res.collector_number?Number.parseInt(res.collector_number):c.cardNumber
          newCard.cardType = res.type_line
          newCard.cmc = res.cmc
          newCard.manaCost = res.mana_cost
          newCard.power = res.power?Number.parseInt(res.power):Number.NaN
          newCard.toughness = res.toughness?Number.parseInt(res.toughness):Number.NaN
          newCard.oracleText = res.oracle_text||""
          // console.log("response to",c,"->",res)
          LocalStorage.SaveT(c.getLSKey(),newCard,Card.toJSON)
          if(newCard.getLSKey() !== c.getLSKey()) LocalStorage.SaveT(newCard.getLSKey(),newCard,Card.toJSON)
          resolve(newCard)
        }, err => {
          console.log("error fetching",c,"->",err)
          reject(err)
        })
      } else {
        // console.log("Cached data for",c.name,"is",cacheCard)
        resolve(cacheCard)
      }
    });
  }

  static prefetchDeck(deckStr:string):Promise<Array<Card>> {
    console.log("Card.prefetchDeck")
    let cards = _.uniqBy( Card.parseDeck(deckStr), c => c.name )
    return Promise.all( cards.map(Card.fetchCardInfo) )
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
