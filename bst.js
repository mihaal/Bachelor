let handler2 = {
    get(target, prop, receiver) {
        let value = target[prop]
        switch (prop) {
            case "key":
                return target[prop]
            case "left":
                if (target[prop] != null) {
                    visualBST.search(target[prop].key)
                }
                return target[prop]
            case "right":
                if (target[prop] != null) {
                    console.log(target[prop].key);
                    visualBST.search(target[prop].key)
                }
            case "children":
                return target[prop]

        }
    },
    set(obj, prop, value) {
        switch (prop) {
            case "key":
                obj[prop] = value
                return true
            case "left":
                if (obj[prop] != null) { 
                    if (value > obj.key) return false
                    obj[prop].key = value
                    visualBST.updateNodes()
                    visualBST.updateHierarchy()
                }
                else {
                    obj[prop] = value    
                }
                return true
            case "right":
                if (obj[prop] != null) {
                    if (value <= obj.key) return false
                    obj[prop].key = value
                    visualBST.updateNodes()
                    visualBST.updateHierarchy()
                }
                else if (obj[prop] == null && !Number.isNaN(value) ) {
                    obj[prop] = new Node(value)    
                    visualBST.updateHierarchy()
                }
                return true
            case "parent":
                obj[prop] = value
                return true
            case "children":
                obj[prop] = value
                return true
        }
        return false;
    }
}

class Node {
    constructor(key) {
        this.key = key;
        this.parent = null;
        this.left = null;
        this.right = null;
        return new Proxy(this, handler2)
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
        if (!matchNumber(value)) return
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