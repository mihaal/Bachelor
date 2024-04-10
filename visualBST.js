class VisualBST {
    #animDuration = 700;
    root;
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
    }

    async searchVisually(value) {
        let node = this.root;
        while (node != null && node.id != value) {
            await this.#paintNode(node.id, "#ff7278")
            if (value < node.id) {
                if (this.childNotExistent(node, 0)) return
                await this.#paintLink(node.id + "left", "#ff7278")
                node = node.children[0]

            } else {
                if (this.childNotExistent(node, 1)) return
                await this.#paintLink(node.id + "right", "#ff7278")
                node = node.children[1]
            }
        }
        if (node.id == value) {
            await this.#paintNode(node.id, "#23fd71")
        }
    }

    childNotExistent(node, child) {
        return node.children == undefined || node.children[child].id == "e"
    }

    async insert(value) {
        if (!matchNumber(value)) {
            alert("Wert muss Zahl < 1000 und > 0 sein!");
            return
        }

        await this.searchVisually(value)
        await this.#resetAnimation()

        if (this.root.id === undefined) {
            this.#deleteRootNode()
        }
        this.updateHierarchy()
        this.#drawAddedLinks()
        this.#updatePositionForAllElements()
    }
    
    async deleteNode(value) {
        await this.searchVisually(value)
        await this.#resetAnimation()


        this.updateHierarchy()
        this.#deleteOldNodes()
        this.#deleteOldLinks()
        this.#updateLinkIdentifiers()
        this.#updatePositionForAllElements()
    }

    async search(value) {
        await this.searchVisually(value)
        this.#resetAnimation()
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
        
        //Falls BST komplett leer, leerer Knoten
        if (this.root.id == undefined) {
            this.#drawAddedNodes()
        }
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
                return "node-" + d.id
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
                .duration(700)
                .attr("transform", function (d) {
                    return `translate(${d.x}, ${d.y})`
                })
                .on("end", () => {
                    resolve()
                })

            this.svg.selectAll('path.link')
                .transition()
                .duration(700)
                .attr('d', function (d) { return drawDiagonalInSVG(d.parent, d) })
                .on("end", () => {
                    resolve()
                })
        })
    }

    #deleteOldNodes() {
        let nodes = this.root.descendants()

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
                .duration(700)
                .style("stroke", null)
                .on("end", function () {
                    resolve()
                })

            this.svg.selectAll("circle")
                .transition()
                .duration(700)
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


