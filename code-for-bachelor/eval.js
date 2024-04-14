function observeChanges(callback) {
    const array = [];
    return new Proxy(array, {
        set(obj, prop, value) {
            callback(prop, value);
            obj[prop] = value;
            return true;
        }
    });    
}
const observedArray = observeChanges(
    (key, value) => console.log(`${key}=${value}`));
observedArray.push('a'); // 0=a
                         // length=1