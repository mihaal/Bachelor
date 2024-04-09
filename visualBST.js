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
        this.tree = d3.tree().size([this.width, this.height]);
        this.updateHierarchy()
        this.#drawAddedNodes()
    }

    searchVisually(value) {
        return new Promise(async (resolve) => {
            let nodeIndex = this.root;
            while (nodeIndex != null && nodeIndex.id != value) {
                await this.#paintNode(nodeIndex.id, "#ff7278")
                if (value <= nodeIndex.id) {
                    if (nodeIndex.children == undefined || nodeIndex.children[0].id == "e") {
                        resolve(nodeIndex)
                    }
                    await this.#paintLink(nodeIndex.id + "left", "#ff7278")
                    nodeIndex = nodeIndex.children[0]

                } else {
                    if (nodeIndex.children == undefined || nodeIndex.children[1].id == "e") {
                        resolve(nodeIndex)
                    }
                    await this.#paintLink(nodeIndex.id + "right", "#ff7278")
                    nodeIndex = nodeIndex.children[1]
                }
            }
            if (nodeIndex.id == value) {
                this.#res = this.#paintNode(nodeIndex.id, "#23fd71")
                resolve(nodeIndex)
            }
        })
    }

    async insert(value) {
        if (!matchNumber(value)) {
            alert("Wert muss Zahl < 1000 und > 0 sein!");
            return
        }

        let res = this.searchVisually(value)

        res.then(async (foundNode) => {
            if (foundNode.id == value) {
                await this.#paintNode(foundNode.id, "#23fd71")
                this.#resetAnimation()
                this.#drawAddedNodes()
                return
            }
            else if (this.root.id === undefined) {
                await this.#resetAnimation()
                this.#deleteRootNode()
            }
            this.updateHierarchy()
            this.#drawAddedLinks()
            await this.#updatePositionForAllElements()
            this.#resetAnimation()
        })
    }

    // man darf nach allem suchen (auch buchstaben), findet halt nur nix
    deleteNode(value) {
        let res = this.searchVisually(value)

        res.then(async (foundNode) => {
            if (foundNode.id != value) return
            await this.#paintNode(foundNode.id, "#23fd71")
            await this.#resetAnimation()
            this.updateHierarchy()
            this.#deleteOldNodes()
            this.#deleteOldLinks()
            this.#updateLinkIdentifiers()
            this.#updatePositionForAllElements()
        })
    }

    search(value) {
        let res = this.searchVisually(value)
        res.then(async (foundNode) => {
            if (foundNode.id == value) {
                await this.#paintNode(foundNode.id, "#23fd71")
                this.#resetAnimation()
            }
        })
    }

    updateHierarchy() {
        this.root = d3.hierarchy(this.bst.root == null ? {} : this.bst.root, function (d) {
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
        this.tree(this.root);
        //leere Wurzel wird immer gezeichnet
        this.#drawAddedNodes()
    }

    #deleteRootNode() {
        d3.select("#node-undefined")
            .remove()
    }

    #drawAddedNodes() {
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
            .attr("id", (d) => {
                return d.id == "e" ? d.id : "node-" + d.id
            })
            .attr("class", function (d) {
                return d.id == "e" ? "hidden" : "node"
            })
            .attr("transform", (d) => {
                if (d.parent != null) {
                    return `translate(${d.parent.x}, ${d.parent.y})`
                }
                return `translate(${this.root.x}, ${this.root.y})`
            });


        node.append("circle")
            .attr('r', 20)
            .attr('cursor', 'pointer');

        node.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text((d) => { return d.id });

        //Leere Knoten werden initial gezeichnet, dann aber direkt entfernt
        this.#removeElementsWithHiddenClass()
    }

    #drawAddedLinks() {
        let links = this.root.descendants().slice(1);
        this.svg.selectAll('path.link')
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
                return d.id == "e" ? "hidden" : "link"
            })
            .attr('d', (d) => {
                return drawDiagonalInSVG(d.parent, d.parent); // Für Start der Animation
            })

        //Gleiche wie bei Nodes
        this.#removeElementsWithHiddenClass()
    }

    #updatePositionForAllElements() {
        return new Promise((resolve) => {
            this.svg.selectAll("g.node")
                .transition()
                .duration(this.#animDuration)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")"
                })

            this.svg.selectAll('path.link')
                .transition()
                .duration(this.#animDuration)
                .attr('d', function (d) { return drawDiagonalInSVG(d.parent, d) })
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
        return new Promise((resolve) => {
            this.svg.selectAll("path")
                .transition()
                .duration(this.#animDuration)
                .style("stroke", null)

            this.svg.selectAll("circle")
                .transition()
                .duration(this.#animDuration)
                .style("fill", null)
                .on("end", function () {
                    resolve()
                })
        })
    }


    #removeElementsWithHiddenClass() {
        d3.selectAll(".hidden")
            .remove()
    }

    #paintNode(nodeID, fillColor) {
        return new Promise((resolve) => {
            d3.select("g#node-" + nodeID + ">circle")
                .transition()
                .duration(this.#animDuration)
                .style("fill", fillColor)
                .on("end", function () { resolve() })
        })
    }

    #paintLink(linkID, fillColor) {
        return new Promise((resolve) => {
            d3.select("#link-" + linkID)
                .transition()
                .duration(this.#animDuration)
                .style("stroke", fillColor)
                .on("end", function () { resolve() })
        })
    }
}

// 
// UTILITY FUNCTIONS
// 
function matchEmpty(value) {
    let regex = /^e.*$/;
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

//XOR damit empty eingefügt wird
function XOR(x, y) {
    return (x || y) && !(x && y);
}

function drawDiagonalInSVG(start, end) {
    return `M ${start.x} ${start.y} ${end.x} ${end.y} `;
}


