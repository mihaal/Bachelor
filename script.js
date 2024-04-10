let width = window.innerWidth
let height = window.innerHeight - 200
let bst = new BinarySearchTree()
let animDuration = 700
let root;
let svg = d3.select("body").insert("svg", ":first-child")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", "translate(0, 40)");
let tree = d3.tree().size([width, height]);

const insertButton = document.getElementById("insertButton");
const deleteButton = document.getElementById("deleteButton");
const numberInput = document.getElementById("numberInput");

updateHierarchy(bst)
drawAddedNodes()

insertButton.addEventListener("click", async function () {
    let value = numberInput.value

    bst.insert(value)
    await searchVisually(value)
    await resetAnimation()
    updateHierarchy(bst)

    if (value == root.data.key) {
        deleteRootNode()
        await drawAddedNodes()
        return
    }

    await updatePositionForExistingElements()
    await drawAddedNodes()
    await drawAddedLinks()
    updatePositionForAllElements()
})

deleteButton.addEventListener("click", function () {
    bst.deleteNode(numberInput.value)
    deleteNode(numberInput.value)
})

async function searchVisually(value) {
    let node = root;
    while (node != null && node.id != value) {
        await paintNode(node.id, "#ff7278")
        if (value < node.id) {
            if (childNotExistent(node, 0)) return
            await paintLink(node.id + "left", "#ff7278")
            node = node.children[0]

        } else {
            if (childNotExistent(node, 1)) return
            await paintLink(node.id + "right", "#ff7278")
            node = node.children[1]
        }
    }
    if (node.id == value) {
        await paintNode(node.id, "#23fd71")
    }
}

function childNotExistent(node, child) {
    return node.children == undefined || node.children[child].id == "e"
}

async function insert(value) {
    if (!matchNumber(value)) {
        alert("Wert muss Zahl < 1000 und > 0 sein!");
        return
    }

    await searchVisually(value)
    await resetAnimation()
    updateHierarchy(bst)

    await updatePositionForExistingNodes()
    await drawAddedNodes()
    await drawAddedLinks()
    updatePositionForAllElements()
}

async function deleteNode(value) {
    await searchVisually(value)
    await resetAnimation()


    updateHierarchy(bst)
    deleteOldNodes()
    deleteOldLinks()
    updateLinkIdentifiers()
    updatePositionForAllElements()
}

async function search(value) {
    await searchVisually(value)
    resetAnimation()
}

function updateHierarchy(bst) {
    root = d3.hierarchy(bst.root == null ? {} : bst.root, function (d) {
        d.children = [];
        if (d.left) {
            d.children.push(d.left);
            if (XOR(d.left, d.right)) {
                d.children.push(new Node("e"));
            }
        }
        if (d.right) {
            if (XOR(d.left, d.right)) {
                d.children.push(new Node("e"));
            }
            d.children.push(d.right);
        }
        return d.children;
    });
    tree(root);
}

function deleteRootNode() {
    d3.select("#node-undefined")
        .remove()
}

function drawAddedNodes() {
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
        .attr("id", (d) => {
            return "node-" + d.id
        })
        .attr("class", function (d) {
            return d.id == "e" ? "hidden" : "node"
        })
        .attr("transform", (d) => {
            return `translate(${d.x}, ${d.y})`
        })
        .style("opacity", 0)


    node.append("circle")
        .attr('r', 20)
        .attr('cursor', 'pointer');

    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text((d) => { return d.id });

    removeElementsWithHiddenClass()

    return new Promise((resolve) => {
        node.transition()
            .duration(700)
            .style("opacity", 1)
            .on("end", function () {
                resolve()
            })
    })
}


function updatePositionForExistingNodes() {
    let nodes = root.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    return new Promise((resolve) => {
        svg.selectAll("g.node")
            .data(nodes, function (individualNode) {
                return individualNode.id = individualNode.data.key
            })
            .transition()
            .duration(700)
            .attr("transform", function (d) {
                return `translate(${d.x}, ${d.y})`
            })
            .on("end", function () {
                resolve()
            })
    })
}

function updatePositionForExistingLinks() {
    let nodes = root.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    console.log(root.descendants().slice(1));

    return new Promise((resolve) => {
        svg.selectAll('path.link')
            .data(nodes.slice(1), function (d) {
                return d.id = d.data.key
            })
            .transition()
            .duration(700)
            .attr('d', function (d) { 
                console.log(d.parent);
                return drawDiagonalInSVG(d.parent, d) })
            .on("end", function () {
                resolve()
            })
    })
}

function updatePositionForExistingElements() {
    let nodes = root.descendants()

    nodes.forEach(function (node) {
        node.y = node.depth * 100
    });

    return new Promise((resolve) => {
        let links = svg.selectAll('path.link')

        if (links.data().length == 0) resolve()
        
        links
            .data(nodes.slice(1), function (d) {
                return d.id = d.data.key
            })
            .transition()
            .duration(700)
            .attr('d', function (d) { 
                console.log(d.parent);
                return drawDiagonalInSVG(d.parent, d) })

        svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id = d.data.key
            })
            .transition()
            .duration(700)
            .attr("transform", function (d) {
                return `translate(${d.x}, ${d.y})`
            })
            .on("end", function () {
                resolve()
            })
    })

}



function drawAddedLinks() {
    let links = root.descendants().slice(1);

    links.forEach(function (node) {
        node.y = node.depth * 100
    });

    let link = svg.selectAll('path.link')
        .data(links, function (d) {
            return d.id
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
            return d.id == "e" ? "hidden" : "link"
        })
        .attr('d', (d) => {
            return drawDiagonalInSVG(d.parent, d.parent); // Für Start der Animation
        })
        
    removeElementsWithHiddenClass()
    return new Promise((resolve) => {
        link.transition()
            .duration(700)
            .attr('d', function (d) {
                return d.id == "e" ? null :  drawDiagonalInSVG(d.parent, d)
            })
            .on("end", () => {
                resolve()
            })
    })

    //Gleiche wie bei Nodes
}

function updatePositionForAllElements() {
    return new Promise((resolve) => {
        svg.selectAll("g.node")
            .transition()
            .duration(700)
            .attr("transform", function (d) {
                return `translate(${d.x}, ${d.y})`
            })
            .on("end", function() {
                resolve()
            })

        svg.selectAll('path.link')
            .transition()
            .duration(700)
            .attr('d', function (d) { return drawDiagonalInSVG(d.parent, d) })
            .on("end", function() {
                resolve()
            })
    })
}

function deleteOldNodes() {
    let nodes = root.descendants()

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
    return new Promise((resolve) => {
        svg.selectAll("path")
            .transition()
            .duration(700)
            .style("stroke", null)
            .on("end", function () {
                resolve()
            })

        svg.selectAll("circle")
            .transition()
            .duration(700)
            .style("fill", null)
            .on("end", function () {
                resolve()
            })
    })
}


function removeElementsWithHiddenClass() {
    d3.selectAll(".hidden")
        .remove()
}

function paintNode(nodeID, fillColor) {
    return new Promise((resolve) => {
        d3.select("g#node-" + nodeID + ">circle")
            .transition()
            .duration(animDuration)
            .style("fill", fillColor)
            .on("end", function () { resolve() })
    })
}

function paintLink(linkID, fillColor) {
    return new Promise((resolve) => {
        d3.select("#link-" + linkID)
            .transition()
            .duration(animDuration)
            .style("stroke", fillColor)
            .on("end", function () { resolve() })
    })
}

function matchNumber(value) {
    let regex = /^[0-9]{1,3}$/;
    let valueAsString = "" + value
    if (valueAsString.match(regex)) {
        return true
    }
    return false
}

//XOR damit empty eingefügt wird
function XOR(x, y) {
    return (x || y) && !(x && y);
}

function drawDiagonalInSVG(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}