let width = window.innerWidth
let height = window.innerHeight - 200
let bst = new BinarySearchTree()
let animDuration = 700
let root;
let svg = d3.select("body").insert("svg", ":first-child")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .append("g")
    .attr("transform", "translate(0, 40)");
let tree = d3.tree().size([width, height]);

const insertButton = document.getElementById("insertButton");
const deleteButton = document.getElementById("deleteButton");
const searchButton = document.getElementById("searchButton");
const numberInput = document.getElementById("numberInput");
updateHierarchy(bst)

insertButton.addEventListener("click", async function () {
    let value = numberInput.value
    bst.insert(value)
})

deleteButton.addEventListener("click", async function () {
    let value = numberInput.value
    bst.deleteNode(value)
})
searchButton.addEventListener("click", async function () {
    let value = numberInput.value
    bst.search(value)
})

async function searchVisually(value) {
    let node = root;
    while (node != null && node.data.key != value) {
        await paintNode(node.data.key, "#ff7278")
        if (value < node.data.key) {
            if (childNotExistent(node, 0)) return
            await paintLink(node.data.key + "left", "#ff7278")
            node = node.children[0]

        } else {
            if (childNotExistent(node, 1)) return
            await paintLink(node.data.key + "right", "#ff7278")
            node = node.children[1]
        }
    }
    if (node.data.key == value) {
        await paintNode(node.data.key, "#23fd71")
    }
}

function childNotExistent(node, child) {
    return node.children == undefined || node.children[child].data.key == "e"
}

//Löschen
async function insert(value) {
    if (!matchNumber(value)) {
        alert("Wert muss Zahl < 1000 und > 0 sein!");
        return
    }

    await searchVisually(value)
    await resetAnimation()
    bst.insert(value)
    updateHierarchy(bst)

    await updatePositionForExistingNodes()
    await drawAddedNodes()
    await drawAddedLinks()
}

//Löschen
async function deleteNode(value) {
    await searchVisually(value)
    await resetAnimation()
    bst.deleteNode(value)

    updateHierarchy(bst)
    deleteOldNodes()
    deleteOldLinks()
    updateLinkIdentifiers()
}

//Löschen
async function search(value) {
    await searchVisually(value)
    resetAnimation()
}

function updateHierarchy(bst) {
    root = d3.hierarchy(bst.root == null ? {} : bst.root, function (d) {
        d.children = [];
        if (d.left) {
            d.children.push(d.left);
            if (xOR(d.left, d.right)) {
                d.children.push(new Node("e"));
            }
        }
        if (d.right) {
            if (xOR(d.left, d.right)) {
                d.children.push(new Node("e"));
            }
            d.children.push(d.right);
        }
        return d.children;
    });
    tree(root);
    root.descendants().forEach(function (node) { node.y = node.depth * 100 })
}

async function drawAddedNodes() {
    let nodes = root.descendants()

    let node = svg.selectAll('g.node')
        .data(nodes, function (d) {
            return d.data.key
        })
        .enter()
        .append("g")
        .attr("id", (d) => {
            return "node-" + d.data.key
        })
        .attr("class", function (d) {
            return d.data.key == "e" ? "hidden" : "node"
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
        .text((d) => { return d.data.key });

    removeElementsWithHiddenClass()

        if (node.data().length == 0) return
        await node.transition()
            .duration(700)
            .style("opacity", 1)
            .end()
}

async function drawAddedLinks() {

    let linksData = root.descendants().slice(1);

    let link = svg.selectAll('path.link')
        .data(linksData, function (d) {
            return d.data.key
        })
        .enter()
        .insert("path", "g")
        .attr("id", function (d) {
            if (d.data.key == d.parent.children[0].data.key) {
                return "link-" + d.parent.data.key + "left"
            }
            return "link-" + d.parent.data.key + "right"
        })
        .attr("class", function (d) {
            return d.data.key == "e" ? "hidden" : "link"
        })
        .attr('d', (d) => {
            return drawDiagonal(d.parent, d.parent); // Für Start der Animation
        })
    removeElementsWithHiddenClass()

    if (link.data().length == 0) return
    await link.transition()
        .duration(700)
        .attr('d', function (d) {
            return d.data.key == "e" ? null : drawDiagonal(d.parent, d)
        })
        .end()
}

async function updateExistingElements() {
    let nodes = root.descendants()
        let links = svg.selectAll('path.link')

        links
            .data(nodes.slice(1), function (d) {
                return d.data.key
            })
            .transition()
            .duration(700)
            .attr('d', function (d) {
                return drawDiagonal(d.parent, d)
            })

        await svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.data.key
            })
            .transition()
            .duration(700)
            .attr("transform", function (d) {
                return `translate(${d.x}, ${d.y})`
            })
            .end()

}

async function deleteOldNodes() {
    let nodesData = root.descendants()

    await svg.selectAll('g.node')
        .data(nodesData, function (d) {
            return d.data.key
        })
        .exit()
        .transition()
        .duration(700)
        .style("opacity", 0)
        .remove()
        .end()
}

async function deleteOldLinks() {
    let linksData = root.descendants().slice(1);

    await svg.selectAll('path.link')
        .data(linksData, function (d) {
            return d.data.key;
        })
        .exit()
        .transition()
        .duration(700)
        .attr('d', function (d) {
            return d.data.key == "e" ? null : drawDiagonal(d.parent, d.parent)
        })
        .remove()
        .end()
}

function updateLinkIdentifiers() {
    svg.selectAll('path.link')
        .attr("id", function (d) {
            if (d.data.key == d.parent.children[0].data.key) {
                return "link-" + d.parent.data.key + "left"
            }
            return "link-" + d.parent.data.key + "right"
        })
}

async function resetAnimation() {

    svg.selectAll("path")
        .transition()
        .duration(700)
        .style("stroke", null)

    await svg.selectAll("circle")
    .transition()
    .duration(700)
    .style("fill", null)
    .end()
}

function removeElementsWithHiddenClass() {
    d3.selectAll(".hidden")
        .remove()
}

async function paintNode(nodeID, fillColor) {

    await svg.select("g#node-" + nodeID + ">circle")
        .transition()
        .duration(animDuration)
        .style("fill", fillColor)
        .end()

}

async function paintLink(linkID, fillColor) {
    await svg.select("#link-" + linkID)
        .transition()
        .duration(animDuration)
        .style("stroke", fillColor)
        .end()
}

function matchNumber(value) {
    let regex = /^[0-9]{1,3}$/;
    let valueAsString = "" + value
    return valueAsString.match(regex);

}

function xOR(x, y) {
    return (x || y) && !(x && y);
}

function drawDiagonal(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}