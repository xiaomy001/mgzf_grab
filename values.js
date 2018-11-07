module.exports = class values {
  constructor(startValue, maxValue) {
    this.maxValue = maxValue;
    this.currentValue = startValue;
    this.failedValue = [];
  }

  addFailedValue(value) {
    this.failedValue.push(value);
  }

  getCurrentValue() {
    if (this.failedValue.length > 0) {
      return this.failedValue.shift();
    }

    if (this.currentValue <= this.maxValue) {
      return this.currentValue++;
    }

    throw new Error("it's over");
  }

  isEnd() {
    return this.failedValue.length === 0 && this.currentValue > this.maxValue;
  }

};
