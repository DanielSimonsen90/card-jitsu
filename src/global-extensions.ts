declare global {
  interface Array<T> {
    random(): T;
  }
}

Array.prototype.random = function() {
  if (this.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  
  const randomIndex = Math.floor(Math.random() * this.length);
  return this[randomIndex];
};

export {}