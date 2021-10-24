class Poll {
  #getNextValue;
  #hasValueChanged;
  #currentValue;

  constructor({ getNextValue, hasValueChanged }) {
    this.#currentValue = null;
    this.#getNextValue = getNextValue;
    this.#hasValueChanged = hasValueChanged;
  }

  async init() {
    this.#currentValue = await this.#getNextValue(this.#currentValue);
  }

  get currentValue() {
    return this.#currentValue;
  }

  async hasValueChanged() {
    const lastValue = this.#currentValue;
    this.#currentValue = await this.#getNextValue(lastValue);
    return this.#hasValueChanged(lastValue, this.#currentValue);
  }
}

module.exports = Poll;
