let virtualBST, visualBST, bst

virtualBST = new BinarySearchTree()
visualBST = new VisualBST(window, virtualBST)


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
bst = new Proxy(virtualBST, handler);

const insertButton = document.getElementById("insertButton");
const deleteButton = document.getElementById("deleteButton");
const numberInput = document.getElementById("numberInput");

insertButton.addEventListener("click", function () {
    proxy.insert(numberInput.value)
})

deleteButton.addEventListener("click", function () {
    proxy.deleteNode(numberInput.value)
})


