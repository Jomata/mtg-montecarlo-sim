export class Card {
  constructor(public name: string) { }

  static parseText(deckString:string):Array<Card> {
    let lines = deckString.split('\n')
    return lines.flatMap(jstr => {
        let matches = jstr.trim().match(/([0-9]+)[\s]+([\S\s]+)/)
        if (matches === undefined) {
          return [];
        }
        else {
          let m = matches as RegExpMatchArray
          if (m.length === 3) {
            let copies = Number.parseInt(m[1])
            let card = new Card(m[2])
            return new Array<Card>(copies).fill(card)
          }
          else {
            return []
          }
        }
      })
  }
}
