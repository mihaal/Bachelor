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
        else {
            switch (prop) {
                case "root":
                    visualBST.search(target[prop].key)
                    return target[prop]
                default:
                    break;
            }
        }
    }
}


bst = new Proxy(virtualBST, handler);

const insertButton = document.getElementById("insertButton");
const deleteButton = document.getElementById("deleteButton");
const numberInput = document.getElementById("numberInput");

insertButton.addEventListener("click", function () {
    bst.insert(numberInput.value)
})

deleteButton.addEventListener("click", function () {
    bst.deleteNode(numberInput.value)
})


