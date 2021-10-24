class PollWatcher {
  #poll;
  #timeout;
  #pollingInterval;
  #shortCircult;

  constructor(poll, { timeout = 10000, pollingInterval = 1000 } = {}) {
    this.#poll = poll;
    this.#timeout = timeout;
    this.#pollingInterval = pollingInterval;
    this.#shortCircult = { enabled: false };
  }

  async watch(thunk = async () => {}) {
    await this.#poll.init();
    await thunk();
    await this.#waitForValueToChange();
    return this.#poll.currentValue;
  }

  cancel() {
    this.#shortCircult.enabled = true;
  }

  async #waitForValueToChange() {
    if (this.#timeout) {
      return Promise.race([
        resolveOnValueChanged(
          this.#poll,
          this.#pollingInterval,
          this.#shortCircult
        ),
        rejectOnTimeout(this.#timeout),
      ]);
    }
    return resolveOnValueChanged(
      this.#poll,
      this.#pollingInterval,
      this.#shortCircult
    );
  }
}

async function resolveOnValueChanged(poll, pollingInterval, shortCircuit) {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const valueHasChanged = await poll.hasValueChanged();
      if (valueHasChanged || shortCircuit.enabled) {
        clearInterval(interval);
        resolve(poll.currentValue);
      }
    }, pollingInterval);
  });
}

function rejectOnTimeout(timeout) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`PollWatcher timed out.`));
    }, timeout);
  });
}

module.exports = PollWatcher;
