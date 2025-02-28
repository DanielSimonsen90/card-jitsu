declare global {
  interface Array<T> {
    random(): T;
  }

  interface Object {
    isEmpty(): boolean;
  }
}

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

Object.prototype.isEmpty = function() {
  return Object.keys(this).length === 0;
}

export {}