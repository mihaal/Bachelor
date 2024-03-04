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
            console.log(x.key)
            this.inOrderWalk(x.right)
        }
    }
}

let marginTop = 40,
    width = window.innerWidth,
    height = 540;

let numbers = [];

let binarySearchTree = new BinarySearchTree();

// in (virtuellen) bst einfügen
for (let i in numbers) {
    binarySearchTree.insert(new Node(numbers[i]));
}

// Main Program

// Erstellt <svg> Objekt und fügt Gruppe (=BST Knoten) als Kind hinzu
let svg = d3.select("body").append("svg")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(0, ${marginTop} )`);

let i = 0,
    duration = 750,
    root,
    treeData, nodes;

// Declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

updateHierarchy()

function updateHierarchy() {
    root = d3.hierarchy(binarySearchTree.root, function (d) {
        d.children = [];
        if (d.left) {
            d.children.push(d.left);
            if (myXOR(d.left, d.right)) {
                d.children.push(new Node("empty"));
            }
        }
        if (d.right) {
            if (myXOR(d.left, d.right)) {
                d.children.push(new Node("empty")
                );
            }
            d.children.push(d.right);
        }
        return d.children;
    });

    root.x0 = width / 2;
    root.y0 = 0;
    treeData = treemap(root);
}

insertNewNodes(root);

function updatePositionForAllNodes(source) {
    svg.selectAll("g.node")
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
}

function updatePositionForAllLinks(source) {
    var link = svg.selectAll('path.link')
        .transition()
        .duration(duration)
        .attr('d', function (d) { return drawDiagonal(d, d.parent) })
}


function insertNewNodes(root) {
    drawNodes(root)
    drawLinks(root)
}

function drawNodes(source) {
    oldNodes = nodes
    nodes = treeData.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    var node = svg.selectAll('g.node')
        .data(nodes, function (individualNode) {
            if (individualNode.data.key == "empty") {
                return individualNode.id = "empty-" + individualNode.parent.data.key
            }
            return individualNode.id = individualNode.data.key
        })
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", function (d) {
            let regex = /^empty-.*$/;
            let value = "" + d.id
            if (value.match(regex)) {
                return "node-empty-" + d.parent.id
            }
        })
        //schöne Ausfächerung der Knoten, beginnend bei der Wurzel
        .attr("transform", function (d) {
            if (d.parent != null) {
                return `translate(${d.parent.x}, ${d.parent.y})`
            }
            return `translate(${source.x0}, ${source.y0})`
        });


    node.append("circle")
        .attr("class", function (d) {
            let regex = /^empty-.*$/;
            let value = "" + d.id
            if (value.match(regex)) {
                return "node-empty"
            }
            return "node"
        })

    // Text in Knoten mit Data/ID
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) { 
            let regex = /^empty-.*$/;
            let value = "" + d.id
            if (value.match(regex)) {
                return "empty"
            }
            return d.id
         });

    node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.select('circle.node')
        .attr('r', 20)
        .attr("id", function (d) {
            if (d.id == "empty") {
                return;
            }
            return "node-" + d.id
        })
        .attr('cursor', 'pointer');

    node.select('circle.node-empty')
        .attr('r', 20)
        .attr('cursor', 'pointer');

    if (oldNodes != null && oldNodes.length == nodes.length) {
        let valueOfParent = node._groups[0].filter(n => n)[0].__data__.parent.id;
        svg.selectAll("#node-empty-" + valueOfParent).remove()
        svg.selectAll(`#link-${valueOfParent}empty-${valueOfParent}`).remove()
    }
}

function drawLinks(source) {
    links = treeData.descendants().slice(1);
    var link = svg.selectAll('path.link')
        .data(links, function (d) { return d.id; })
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("id", function (d) {
            return "link-" + d.parent.id + d.id
        })
        .attr('d', function (d) {
            var o = { x: source.x0, y: source.y0 };
            if (d.parent != null) {
                var o = { x: d.parent.x, y: d.parent.y };
            }
            return drawDiagonal(o, o);
        })

    // Transition back to the parent element position
    link.transition()
        .duration(duration)
        .attr('d', function (d) { return drawDiagonal(d, d.parent) });
}

// M = Move To = Startpunkt x0 y0 -> Endpunkt x1 y1
function drawDiagonal(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}

function myXOR(a, b) {
    return (a || b) && !(a && b);
}

function insertNode() {
    let value = document.getElementById("numberInput").value
    let regex = /^[0-9]{1,3}$/;
    if (!value.match(regex)) {
        alert("Wert muss Zahl (< 1000) sein!");
        return
    }
    binarySearchTree.insert(new Node(new Number(value)))
    updateHierarchy()
    update(root)
}

function search() {
    let value = document.getElementById("numberInput").value
    let regex = /^[0-9]{1,3}$/;
    if (!value.match(regex)) {
        alert("Wert muss Zahl (< 1000) sein!");
        return
    }

    binarySearchTree.insert(new Node(new Number(value)))
    updateHierarchy()
    insertNewNodes(root)
    updatePositionForAllNodes(root)
    updatePositionForAllLinks(root)
}



