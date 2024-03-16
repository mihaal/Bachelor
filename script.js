let marginTop = 40,
    width = window.innerWidth,
    height = window.innerHeight - 100,
    animDuration = 700;

let binarySearchTree = new BinarySearchTree();

// in (virtuellen) bst einfügen
for (let i = 0; i < 1; i++) {
    binarySearchTree.insert(new Node(Math.floor(Math.random() * 1000 - 1)));
}

// Erstellt <svg> Objekt und fügt Gruppe (=BST Knoten) als Kind hinzu
let svg = d3.select("body").append("svg")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", `translate(0, ${marginTop} )`);

let root,
    res;

// Baum Layout
var treemap = d3.tree().size([width, height]);

function updateHierarchy(binarySearchTree) {
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
                d.children.push(new Node("empty"));
            }
            d.children.push(d.right);
        }
        return d.children;
    });
    treeData = treemap(root);
}

// updateHierarchy(),

function drawNodes() {
    let nodes = root.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    var node = svg.selectAll('g.node')
        .data(nodes, function (individualNode) {
            return individualNode.id = individualNode.data.key
        })
        .enter()
        .append("g")
        .attr("class", function (d) {
            return matchEmpty(d.id) ? "hidden" : "node"
        })
        .attr("id", (d) => {
            return "node-" + d.id
        })
        .attr("transform", function (d) {
            if (d.parent != null) {
                return `translate(${d.parent.x}, ${d.parent.y})`
            }
            return `translate(${root.x}, ${root.y})`
        });


    node.append("circle")

    // Text in Knoten mit Data/ID
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text((d) => { return d.id });

    node.transition()
        .duration(animDuration)
        .attr("transform", (d) => {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.select('circle')
        .attr('r', 20)
        .attr('cursor', 'pointer');
    
    //Leere Knoten werden initial gezeichnet, dann aber direkt entfernt(sonst ist Kindknoten direkt gerade unter Elternknoten)
    removeElementsWithHiddenClass()
}

function drawLinks() {
    let links = root.descendants().slice(1);
    var link = svg.selectAll('path.link')
        .data(links, function (d) {
            return d.id;
        })
        .enter()
        .insert("path", "g")
        .attr("id", function (d) {
            if (d.id == d.parent.children[0].id) {
                return "link-" + d.parent.id + "left"
            }
            return "link-" + d.parent.id + "right"
        })
        .attr("class", function (d) {
            return matchEmpty(d.id) ? "hidden" : "link"
        })
        .attr('d', function (d) {
            var o = { x: root.x0, y: root.y0 };
            if (d.parent != null) {
                var o = { x: d.parent.x, y: d.parent.y };
            }
            return drawDiagonal(o, o);
        })

    link.transition()
        .duration(animDuration)
        .attr('d', function (d) {
            return drawDiagonal(d, d.parent)
        });
    
    //Gleiche wie bei Nodes
    removeElementsWithHiddenClass()
}


function removeElementsWithHiddenClass() {
    d3.selectAll(".hidden")
        .remove()
}

// M = Move To = Startpunkt x0 y0 -> Endpunkt x1 y1
function drawDiagonal(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}

//damit empty eingefügt wird
function myXOR(a, b) {
    return (a || b) && !(a && b);
}


function searchNodeVisually(value) {
    let animMultiplier = 1;
    let nodeIndex = root;
    while (nodeIndex != null && nodeIndex.id != value) {
        res = paintNode(nodeIndex.id, animMultiplier++, "#ff7278")
        if (value <= nodeIndex.id) {
            if (nodeIndex.children === undefined || matchEmpty(nodeIndex.children[0].id)) {
                return nodeIndex
            }
            paintLink(nodeIndex.id + "left", animMultiplier++, "#ff7278")
            nodeIndex = nodeIndex.children[0]

        } else {
            if (nodeIndex.children === undefined || matchEmpty(nodeIndex.children[1].id)) {
                return nodeIndex
            }
            paintLink(nodeIndex.id + "right", animMultiplier++, "#ff7278")
            nodeIndex = nodeIndex.children[1]
        }
    }

    // needs to be inside here bc of animMultiplier
    if (nodeIndex.id == value) {
        res = paintNode(nodeIndex.id, animMultiplier++, "#23fd71")
    }
    return nodeIndex;
}

function insertNode() {
    let value = document.getElementById("numberInput").value
    if (!matchNumber(value)) {
        alert("Wert muss Zahl < 1000 und > 0 sein!");
        return
    }

    let nodeFound = binarySearchTree.search(value)
    searchNodeVisually(value)

    res.then(() => {
        if (nodeFound == null) {
            binarySearchTree.insert(new Node(new Number(value)))
            updateHierarchy()
            insertNewNodes(root)
            let res1 = updatePositionForAllLinks()
            let res2 = updatePositionForAllNodes()

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

function deleteNode() {
    let value = document.getElementById("numberInput").value
    if (!matchNumber(value)) {
        alert("Wert muss Zahl < 1000 und > 0 sein!"); 
        return
    }

    let nodeFound = binarySearchTree.search(value)
    searchNodeVisually(value)

    console.log(value);
    console.log(nodeFound);

    res.then(() => {
        if (nodeFound.key == value) {
            binarySearchTree.delete(binarySearchTree.search(value))
            console.log("after delete");
            updateHierarchy()
            deleteOldNodes()
            deleteOldLinks()
            updateLinkIdentifiers()
            let res1 = updatePositionForAllNodes()
            let res2 = updatePositionForAllLinks()
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

function updatePositionForAllNodes() {
    return new Promise((resolve) => {
        svg.selectAll("g.node")
            .transition()
            .duration(animDuration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
            .on("end", () => {
                resolve()
            })
    })
}

function updatePositionForAllLinks() {

    return new Promise((resolve) => {
        svg.selectAll('path.link')
            .transition()
            .attr('d', function (d) { return drawDiagonal(d, d.parent) })
            .on("end", () => {
                resolve()
            })
    })
}

function deleteOldNodes() {
    let nodes = root.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    svg.selectAll('g.node')
        .data(nodes, function (individualNode) {
            return individualNode.id = individualNode.data.key
        })
        .exit()
        .remove()
}

function deleteOldLinks() {
    let links = root.descendants().slice(1);
    svg.selectAll('path.link')
        .data(links, function (d) {
            return d.id;
        })
        .exit()
        .remove()
}

function updateLinkIdentifiers() {
    svg.selectAll('path.link')
        .attr("id", function (d) {
            if (d.id == d.parent.children[0].id) {
                return "link-" + d.parent.id + "left"
            }
            return "link-" + d.parent.id + "right"
        })
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

function matchEmpty(value) {
    let regex = /^empty.*$/;
    let valueAsString = "" + value
    if (valueAsString.match(regex)) {
        return true
    }
    return false
}

function matchNumber(value) {
    let regex = /^[0-9]{1,3}$/;
    let valueAsString = "" + value
    if (valueAsString.match(regex)) {
        return true
    }
    return false
}

function paintNode(nodeID, animMultiplier, fillColor) {
    return new Promise((resolve) => {
        d3.select("g#node-" + nodeID + ">circle")
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
