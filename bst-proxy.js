let virtualBST = new BinarySearchTree()
virtualBST.insert(20)
let visualBST = new VisualBST(window, virtualBST)
visualBST.updateHierarchy(virtualBST)

let handler = {
    get(target, prop, receiver) {
        console.log("target")
        console.log(target)
        console.log("prop")
        console.log(prop)
        console.log("receiver")
        console.log(receiver)
        let value = target[prop]
        console.log("value");
        console.log(value);
        if (value instanceof Function) {
            return function (...args) {
                value.apply(this === receiver ? target : this, args);
                visualBST[prop](...args)
            }
        }
    }
}
const proxy = new Proxy(virtualBST, handler);