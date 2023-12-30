module.exports = class TimeoutMap extends Map {
    constructor(timeout) {
        super();
        this.timeout = timeout;
    }
 
    set(key, value) {
        const timeoutId = setTimeout(() => {
            this.delete(key);
        }, this.timeout);
 
        super.set(key, { value, timeoutId });
    }

    delete(key) {
        clearTimeout(super.get(key).timeoutId);
        super.delete(key);
    }
 }