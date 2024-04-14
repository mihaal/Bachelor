let otherArray = []
let handler = {
    set(obj, prop, value) {
        obj[prop] = value
        otherArray[prop] = value
        return true
    }
}
const proxy = new Proxy([], handler);
proxy.push('a');
proxy.push('b');
console.log(otherArray); // [ 'a', 'b' ]