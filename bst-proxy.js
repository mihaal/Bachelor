let virtualBST = new BinarySearchTree()
virtualBST.insert(20)
let visualBST = new VisualBST(window, virtualBST)
visualBST.updateHierarchy(virtualBST)

let handler = {
    get(target, prop, receiver) {
        let value = target[prop]
        if (value instanceof Function) {
            return function (...args) {
                value.apply(this === receiver ? target : this, args);
                visualBST[prop](...args)
            }
        }
    }
}
const proxy = new Proxy(virtualBST, handler);