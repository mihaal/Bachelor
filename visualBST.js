class VisualBST {
    #animDuration = 700;
    root;
    #res;
    constructor(window, binarySearchTree) {
        this.width = window.innerWidth
        this.height = window.innerHeight - 200
        this.bst = binarySearchTree
        this.svg = d3.select("body").insert("svg", ":first-child")
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .append("g")
            .attr("transform", "translate(0, 40)");
        this.treemap = d3.tree().size([this.width, this.height]);
        this.updateHierarchy()
    }

    searchVisually(value) {
        let animMultiplier = 1;
        let nodeIndex = this.root;
        while (nodeIndex != null && nodeIndex.id != value) {
            this.#res = paintNode(nodeIndex.id, animMultiplier++, "#ff7278")
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

        // muss innerhalb dieser Funktion sein wegen fortlaufendem animMultiplier
        if (nodeIndex.id == value) {
            this.#res = paintNode(nodeIndex.id, animMultiplier++, "#23fd71")
        }
        return nodeIndex;
    }

    insert(value) {
        if (!matchNumber(value)) {
            alert("Wert muss Zahl < 1000 und > 0 sein!");
            return
        }

        this.search(value)

        this.#res.then(() => {
            this.updateHierarchy()
        })
    }

    // man darf nach allem suchen (auch buchstaben), findet halt nur nix
    deleteNode(value) {
        this.search(value)

        this.#res.then(() => {
            this.updateHierarchy()
        })
    }

    search(value) {
        this.searchVisually(value)
        this.#res.then(() => {
            this.#resetAnimation()
        })
    }

    updateHierarchy() {
        this.root = d3.hierarchy(this.bst.root == null ? {} : this.bst.root, function (d) {
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
        this.treemap(this.root);
        this.#drawAddedNodes()
        this.#drawAddedLinks()
        this.#updateLinkIdentifiers()
        let res1 = this.#updatePositionForAllNodes()
        let res2 = this.#updatePositionForAllLinks()
        res1.then(() => {
            res2.then(() => {
                this.#resetAnimation()
            })
        })
        this.#deleteOldNodes()
        this.#deleteOldLinks()

    }

    #drawAddedNodes() {
        let root = this.root
        let nodes = this.root.descendants()

        nodes.forEach(function (node) {
            node.y = node.depth * 100
        });

        var node = this.svg.selectAll('g.node')
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

        node.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text((d) => { return d.id });

        node.transition()
            .duration(this.#animDuration)
            .attr("transform", (d) => {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.select('circle')
            .attr('r', 20)
            .attr('cursor', 'pointer');

        //Leere Knoten werden initial gezeichnet, dann aber direkt entfernt(sonst ist Kindknoten direkt gerade unter Elternknoten)
        removeElementsWithHiddenClass()
    }

    #drawAddedLinks() {
        let root = this.root
        let links = this.root.descendants().slice(1);
        console.log(links);
        var link = this.svg.selectAll('path.link')
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
            .duration(this.#animDuration)
            .attr('d', function (d) {
                return drawDiagonal(d, d.parent)
            });

        //Gleiche wie bei Nodes
        removeElementsWithHiddenClass()
    }

    #updatePositionForAllNodes() {
        return new Promise((resolve) => {
            this.svg.selectAll("g.node")
                .transition()
                .duration(this.#animDuration)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")"
                })
                .on("end", () => {
                    resolve()
                })
        })
    }

    #updatePositionForAllLinks() {

        return new Promise((resolve) => {
            this.svg.selectAll('path.link')
                .transition()
                .attr('d', function (d) { return drawDiagonal(d, d.parent) })
                .on("end", () => {
                    resolve()
                })
        })
    }

    #deleteOldNodes() {
        let nodes = this.root.descendants()

        nodes.forEach(function (node) {
            node.y = node.depth * 100
        });

        this.svg.selectAll('g.node')
            .data(nodes, function (individualNode) {
                return individualNode.id = individualNode.data.key
            })
            .exit()
            .remove()
    }

    #deleteOldLinks() {
        let links = this.root.descendants().slice(1);
        this.svg.selectAll('path.link')
            .data(links, function (d) {
                return d.id;
            })
            .exit()
            .remove()
    }

    #updateLinkIdentifiers() {
        this.svg.selectAll('path.link')
            .attr("id", function (d) {
                if (d.id == d.parent.children[0].id) {
                    return "link-" + d.parent.id + "left"
                }
                return "link-" + d.parent.id + "right"
            })
    }

    #resetAnimation() {
        this.svg.selectAll("path")
            .transition()
            .duration(this.#animDuration)
            .style("stroke", null)

        this.svg.selectAll("circle")
            .transition()
            .duration(this.#animDuration)
            .style("fill", null)
    }
}

// 
// UTILITY FUNCTIONS
// 
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

//damit empty eingefügt wird
function myXOR(a, b) {
    return (a || b) && !(a && b);
}

function drawDiagonal(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}

function removeElementsWithHiddenClass() {
    d3.selectAll(".hidden")
        .remove()
}

function paintNode(nodeID, animMultiplier, fillColor) {
    return new Promise((resolve) => {
        d3.select("g#node-" + nodeID + ">circle")
            .transition()
            .duration(750)
            .delay(740 * animMultiplier)
            .style("fill", fillColor)
            .on("end", function () { resolve() })
    })
}

function paintLink(linkID, animMultiplier, fillColor) {
    return new Promise((resolve) => {
        d3.select("#link-" + linkID)
            .transition()
            .duration(750)
            .delay(740 * animMultiplier)
            .style("stroke", fillColor)
            .on("end", function () { resolve() })
    })
}


