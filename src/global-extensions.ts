declare global {
  interface Array<T> {
    random(): T;
  }
}

Array.prototype.random = function() {
  const getRandomIndex = () => Math.floor(Math.random() * this.length);
  const randomIndex = (() => {
    while (true) {
      const index = getRandomIndex();
      if (index >= 0 && index < this.length) return index;
    }
  })();

  return this[randomIndex];
};

export {}