let handler2 = {
    get(target, prop, receiver) {
        let value = target[prop]
        if (value instanceof Function) {
            if (!(prop == "insert" || prop == "deleteNode" || prop == "search")) {
                return function (...args) {
                    return value.apply(this === receiver ? target : this, args);
                }
            }
            return async function (...args) {
                if (!matchNumber(args)) {
                    alert("Wert muss Zahl < 1000 und > 0 sein!");
                    return
                }
                let ret;
                await searchVisually(args)
                await resetAnimation()
                ret = value.apply(this === receiver ? target : this, args);
                if (prop == "search") return
                updateHierarchy(target)

                switch (prop) {
                    case "insert":
                        await updatePositionForExistingElements()
                        await drawAddedLinks()
                        await drawAddedNodes()
                        return ret;
                    case "deleteNode":
                        await deleteOldNodes()
                        await deleteOldLinks()
                        updatePositionForExistingElements()
                        updateLinkIdentifiers()
                        return ret
                }
            }
        }
        return value
    }
}

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
        return new Proxy(this, handler2)
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

    insert(value) {
        let node = this.search(value)
        if (node != null) return
        node = new Node(parseInt(value));
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

    preorderWalk(x) {
        if (x != null) {
            console.log(x.key);
            this.preorderWalk(x.left)
            this.preorderWalk(x.right)
        }
    }

    inorderWalk(x) {
        if (x != null) {
            this.inorderWalk(x.left)
            console.log(x.key);
            this.inorderWalk(x.right)
        }
    }

    postorderWalk(x) {
        if (x != null) {
            this.postorderWalk(x.left)
            this.postorderWalk(x.right)
            console.log(x.key);
        }
    }


    transplantSubtree(u, v) {
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
            this.transplantSubtree(node, node.right)
        }
        else if (node.right == null) {
            this.transplantSubtree(node, node.left)
        }
        else {
            let y = this.treeMinimum(node.right)
            if (y.parent != node) {
                this.transplantSubtree(y, y.right)
                y.right = node.right
                y.right.parent = y
            }
            this.transplantSubtree(node, y)
            y.left = node.left
            y.left.parent = y
        }
    }
}