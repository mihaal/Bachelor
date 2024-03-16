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
    insert(value) {
        let node = new Node(value);
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

    deleteNode(value) {
        let node = this.search(value)
        if (node == null) return
        else if (node.left == null) {
            this.transPlantSubtree(node, node.right)
        }
        else if (node.right == null) {
            this.transPlantSubtree(node, node.left)
        }
        else {
            let y = this.treeMinimum(node.right)
            if (y.parent != node) {
                this.transPlantSubtree(y, y.right)
                y.right = node.right
                y.right.parent = y
            }
            this.transPlantSubtree(node, y)
            y.left = node.left
            y.left.parent = y
        }
    }
}