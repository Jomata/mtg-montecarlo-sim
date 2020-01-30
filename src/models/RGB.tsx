export class RGB {
  constructor(public red: number, public green: number, public blue: number) { }
  public interpolateWith(another: RGB, percent: number) {
    //making percent from 0 to 1 if it's > 1
    if (percent > 1)
      percent /= 100;
    let resultRed = this.red + percent * (another.red - this.red);
    let resultGreen = this.green + percent * (another.green - this.green);
    let resultBlue = this.blue + percent * (another.blue - this.blue);
    return new RGB(resultRed, resultGreen, resultBlue);
  }
  public toCSS() {
    return `rgb(${this.red},${this.green},${this.blue})`;
  }
}
