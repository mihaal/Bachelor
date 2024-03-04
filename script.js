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

let numbers = [23, 10, 24, 243, 5, 6];

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
    treeData;

// Declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

// virtueller bst -> visueller bst
// jeder Knoten hat folgende Eigenschaften:
// node.data - the associated data as passed to hierarchy
// node.depth - zero for the root, increasing by one for each descendant generation
// node.height - the greatest distance from any descendant leaf, or zero for leaves
// node.parent - the parent node, or null for the root node
// node.children - an array of child nodes, if any, or undefined for leaves
// node.value - the optional summed value of the node and its descendants



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
    treeData = treemap(root);
}

updateHierarchy()

root.x0 = width / 2;
root.y0 = 0;

update(root);


function update(source) {
    // Assigns the x and y position for the nodes

    // root node has no links to, so - 1 element
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    // **************** Nodes Section ****************

    // ID of Node = Value (means no duplicates!!)
    // g.node gibt nichts zurück, deswegen wird in .enter() alle nodes gespeichert, die 
    // nicht in der <G>ruppe sind
    var node = svg.selectAll('g.node')
        .data(nodes, function (individualNode) { return individualNode.id = individualNode.data.key })
        .enter()
        .append("g")
        .attr("class", "node")
        //schöne Ausfächerung der Knoten, beginnend bei der Wurzel
        .attr("transform", function (d) {
            if (d.parent != null) {
                return `translate(${d.parent.x}, ${d.parent.y})`    
            }
            return `translate(${source.x0}, ${source.y0})`
        });

    node.append("circle")
        .attr("class", function (d) {
            if (d.id == "empty") {
                return "node-empty"
            }
            return "node"
        })

    // Text in Knoten mit Data/ID
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (individualNode) { return individualNode.id; });

    node.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.select('circle.node')
        .attr('r', 20)
        .attr("id", function (d) {
            if (d.id === "empty") {
                return;
            }
            return "node-" + d.id
        })
        .attr('cursor', 'pointer');

        node.select('circle.node-empty')
        .attr('r', 20)
        .attr("id", function (d) {
            if (d.id === "e") {
                return;
            }
            return "node-" + d.id
        })
        .attr('cursor', 'pointer');

    // Update the links...
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

    console.log("link");
    console.log(link);

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
    binarySearchTree.insert(new Node(value))
    binarySearchTree.inOrderWalk(binarySearchTree.root)
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

    let node = root.data;
    console.log("root.data");
    console.log(root.data);
    let finalNode = paintNodes(node, value)
    if (finalNode == null) {
        binarySearchTree.insert(new Node(new Number(value)))
        updateHierarchy()
        update(root)
    }
}


function paintNodes(root, number) {
    let node = root;
    let value = Number(number)
    while (node != null && node.key != value) {
        d3.select("#node-" + node.key).transition().duration(400)
            .style("fill", "green")
        if (value <= node.key) {
            d3.select("#node-" + node.key).transition().duration(400).delay(600)
                .style("fill", "#a8e3e3")
            node = node.left
            if (node != null) {
                d3.select("#link-" + node.parent.key + node.key).transition().duration(600).delay(800)
                    .style("stroke", "green")
                d3.select("#link-" + node.parent.key + node.key).transition().duration(600).delay(1600)
                    .style("stroke", "#ccc")
                d3.select("#node-" + node.key).transition().duration(600).delay(2400)
                    .style("fill", "green")
            }
        }
        else {
            d3.select("#node-" + node.key).transition().duration(600).delay(800)
                .style("fill", "#a8e3e3")
            node = node.right
            if (node != null) {
                d3.select("#link-" + node.parent.key + node.key).transition().duration(600).delay(800)
                    .style("stroke", "green")
                d3.select("#link-" + node.parent.key + node.key).transition().duration(600).delay(1600)
                    .style("stroke", "#ccc")
                d3.select("#node-" + node.key).transition().duration(600).delay(2400)
                    .style("fill", "green")
            }
        }
    }
    return node
}
