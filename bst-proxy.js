class Node {
    constructor(key) {
        this.key = key;
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    search(key) {
        let node = this.root
        while (node != null && node.key != key) {
            if (key <= node.key) {
                node = node.left
            }
            else {
                node = node.right
            }
        }
        return node
    }

    //iterative
    insert(node) {
        let y = null
        let x = this.root
        while (x != null) {
            y = x
            if (node.key < x.key) {
                x = x.left
            } else {
                x = x.right
            }
        }
        node.parent = y
        if (y == null) {
            this.root = node;
        }
        else if (node.key < y.key) {
            y.left = node
        }
        else y.right = node
    }

    inOrderWalk(x) {
        if (x != null) {
            this.inOrderWalk(x.left)
            console.log(x.key);
            this.inOrderWalk(x.right)
        }
    }
    transPlantSubtree(u, v) {
        if (u.parent == null) {
            this.root = v
        }
        else if (u == u.parent.left) {
            u.parent.left = v
        }
        else {
            u.parent.right = v
        }
        if (v != null) {
            v.parent = u.parent
        }
    }

    treeMinimum(node) {
        while (node.left != null) {
            node = node.left
        }
        return node
    }

    delete(value) {
        if (value.left == null) {
            this.transPlantSubtree(value, value.right)
        }
        else if (value.right == null) {
            this.transPlantSubtree(value, value.left)
        }
        else {
            let y = this.treeMinimum(value.right)
            if (y.parent != value) {
                this.transPlantSubtree(y, y.right)
                y.right = value.right
                y.right.parent = y
            }
            this.transPlantSubtree(value, y)
            y.left = value.left
            y.left.parent = y
        }
    }
}

let test = new BinarySearchTree()

const handler = {
    get(target, prop, receiver) {
        let value = target[prop]

        if (value instanceof Function) {
            return function (...args) {
              return value.apply(this === receiver ? target : this, args);
            };
        }
    }

    
}

let bst = new Proxy(test, handler)

bst.insert(new Node(20))
bst.inOrderWalk(bst.root)