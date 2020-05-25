window.onresize = drawGraph();
const svg = d3.select('svg');
function drawGraph() {
    const height = window.innerHeight * 1.5;
    const width = window.innerWidth * 0.95;
    const simulation = d3
        .forceSimulation()
        .force(
            'link',
            d3
                .forceLink()
                .id(function (d) {
                    return d.name;
                })
                .distance(100)
        )
        .force(
            'charge',
            d3.forceManyBody().strength(function (d) {
                if (d.continent === undefined) {
                    return -70;
                } else {
                    return -30;
                }
            })
        )
        .force('center', d3.forceCenter(width / 2, height / 2.5));

    drawSVG();
    drawContinents(simulation);
}

function drawSVG() {
    const height = window.innerHeight * 1.5;
    const width = window.innerWidth * 0.95;

    d3.select('#graphContainer')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'white')
        .style('opacity', 0.5);
}

function drawContinents(simulation) {
    d3.json('../js/data.json', function (error, graph) {
        if (error) throw error;

        const link = svg
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graph.links)
            .enter()
            .append('line')
            .attr('stroke-width', 3)
            .attr('stroke', 'black');

        const node = svg
            .append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(graph.nodes)
            .enter()
            .append('g');

        const circles = node
            .append('circle')
            .attr('r', function (d) {
                if (d.continent === undefined) {
                    return 30;
                } else {
                    return 20;
                }
            })
            .attr('fill', function (d) {
                let color;
                switch (d.continent) {
                    case 'Europe':
                        color = 'lightgreen';
                        break;
                    case 'Asia':
                        color = 'yellow';
                        break;
                    case 'Oceania':
                        color = 'green';
                        break;
                    case 'North America':
                        color = 'cyan';
                        break;
                    case 'South America':
                        color = 'pink';
                        break;
                    case 'Africa':
                        color = 'lightgray';
                        break;
                }
                if (d.continent === undefined) {
                    color = 'red';
                }
                return color;
            })
            .call(
                d3
                    .drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );

        const lables = node
            .append('text')
            .text(function (d) {
                if (d.name === 'Main') {
                    return '';
                } else {
                    return d.abbreviation;
                }
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle');

        node.append('title').text(function (d) {
            return d.name;
        });

        simulation.nodes(graph.nodes).on('tick', ticked);
        simulation.force('link').links(graph.links);
        function ticked() {
            link.attr('x1', function (d) {
                return d.source.x;
            })
                .attr('y1', function (d) {
                    return d.source.y;
                })
                .attr('x2', function (d) {
                    return d.target.x;
                })
                .attr('y2', function (d) {
                    return d.target.y;
                });

            node.attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        }
    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}
