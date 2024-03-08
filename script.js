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
    height = 540,
    animDuration = 700;

let numbers = [4, 1, 5, 3];

let binarySearchTree = new BinarySearchTree();

// in (virtuellen) bst einfügen
for (let i in numbers) {
    binarySearchTree.insert(new Node(numbers[i]));
}

// Erstellt <svg> Objekt und fügt Gruppe (=BST Knoten) als Kind hinzu
let svg = d3.select("body").append("svg")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(0, ${marginTop} )`);

let duration = 750,
    animMultiplier = 1,
    root,
    nodes,
    res;

// Declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

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

updateHierarchy()
insertNewNodes(root);

function updatePositionForAllNodes() {
    return new Promise((resolve, reject) => {
        svg.selectAll("g.node")
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
            .on("end", () => {
                resolve()
            })

    })
}

function updatePositionForAllLinks() {

    return new Promise((resolve, reject) => {
        svg.selectAll('path.link')
            .transition()
            .attr('d', function (d) { return drawDiagonal(d, d.parent) })
            .on("end", () => {
                resolve()
            })
    })
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

    node.select('circle')
        .attr('r', 20)
        .attr("id", function (d) {
            let regex = /^empty-.*$/;
            let value = "" + d.id
            if (value.match(regex)) {
                return "node-empty-" + d.parent.id
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
        .data(links, function (d) {
            return d.id;
        })
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("id", function (d) {
            if (d.id == d.parent.children[0].id) {
                return "link-" + d.parent.id + "left"
            }
            return "link-" + d.parent.id + "right"
        })
        .attr('d', function (d) {
            var o = { x: source.x0, y: source.y0 };
            if (d.parent != null) {
                var o = { x: d.parent.x, y: d.parent.y };
            }
            return drawDiagonal(o, o);
        })

    link.transition()
        .duration(animDuration)
        .attr('d', function (d) {
            console.log(d);
            console.log(d.parent);
            return drawDiagonal(d, d.parent)
        });
}

// M = Move To = Startpunkt x0 y0 -> Endpunkt x1 y1
function drawDiagonal(start, end) {
    console.log(start.id + " " + end.id);
    console.log(start.x + " " + start.y + " " + end.x + " " + end.y);
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}

//damit empty eingefügt wird
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

    let nodeFound = search(value)

    res.then(() => {

        if (nodeFound.data.key == "empty") {
            console.log("here");
            replaceEmptyNode(nodeFound.id, value)
            binarySearchTree.insert(new Node(new Number(value)))
            updateHierarchy()
            resetAnimation()
        }

        else if (nodeFound.id != value) {
            binarySearchTree.insert(new Node(new Number(value)))
            updateHierarchy()
            insertNewNodes(root)
            let res1 = updatePositionForAllLinks(root)
            let res2 = updatePositionForAllNodes(root)

            res1.then(() => {
                res2.then(() => {
                    resetAnimation()
                })
            })
        }
        else {
            resetAnimation()
        }
    })
}

function replaceEmptyNode(idOfNode, value) {

    svg.select(`#node-${idOfNode}>circle`)
        .classed("node-empty", false)
        .classed("node", true)

    svg.select(`#node-${idOfNode}>text`)
        .text(value)

    svg.select(`#node-${idOfNode}`)
        .attr("id", null)
}

function resetAnimation() {
    svg.selectAll("path")
        .transition()
        .duration(animDuration)
        .style("stroke", null)

    svg.selectAll("circle")
        .transition()
        .duration(animDuration)
        .style("fill", null)
}

function search(value) {
    let animMultiplier = 1;
    let nodeIndex = root;
    while (nodeIndex != null && nodeIndex.id != value) {
        res = paintNode(nodeIndex.id, animMultiplier++, "red")
        if (value <= nodeIndex.id) {
            if (nodeIndex.children === undefined) {
                break
            }
            res = paintLink(nodeIndex.id + "left", animMultiplier++, "red")
            nodeIndex = nodeIndex.children[0]

        } else {
            if (nodeIndex.children === undefined) {
                break
            }
            res = paintLink(nodeIndex.id + "right", animMultiplier++, "red")
            nodeIndex = nodeIndex.children[1]
        }
    }

    if (nodeIndex.id == value) {
        res = paintNode(nodeIndex.id, animMultiplier++, "green")
    }
    return nodeIndex;
}

function paintNode(nodeID, animMultiplier, fillColor) {

    return new Promise((resolve) => {
        d3.select("circle#node-" + nodeID)
            .transition()
            .duration(animDuration)
            .delay(animDuration * animMultiplier)
            .style("fill", fillColor)
            .on("end", function () { resolve() })
    })

}

function paintLink(linkID, animMultiplier, fillColor) {

    return new Promise((resolve) => {
        d3.select("#link-" + linkID)
            .transition()
            .duration(animDuration)
            .delay(animDuration * animMultiplier)
            .style("stroke", fillColor)
            .on("end", function () { resolve() })
    })
}
