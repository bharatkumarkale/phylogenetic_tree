let data = [],
    root = null,
    labels = {},
    legend = {},
    targetID = 'treeCanvas',
    targetEle,
    targetSVG,
    targetG,
    totalWidth,
    totalHeight,
    width,
    height,
    margin = {l:0, r:0, t:0, b:0},
    diameter,
    radius,
    padding = 2.5,
    label_band_width = 40,
    defaultStrokeColor = '#aaaaaa',
    useRadial = true,

    targetSubView1ID = 'subView1',
    targetSubView1Ele,
    targetSubView1SVG,
    targetSubView1G,
    targetSubView1Width,
    targetSubView1Height,
    msaViewID = 'subView2B2',
    msaViewEle,
    msaViewSVG,
    msaViewG,
    msaViewWidth,
    msaViewHeight,
    msaLblViewID = 'subView2B1',
    msaLblViewEle,
    msaLblViewSVG,
    msaLblViewG,
    msaLblViewWidth,
    msaLblViewHeight,
    msaLblConservationViewID = 'subView2A2',
    msaLblConservationViewEle,
    msaLblConservationViewSVG,
    msaLblConservationViewG,
    msaLblConservationViewWidth,
    msaLblConservationViewHeight,
    msaLblConservationViewAxis,
    pie = d3.pie().value(d => d.v),
    pie_data = [],
    arc = d3.arc()
    pie_innerR = 0,
    pie_outerR = 0,
    msa_xScale = d3.scaleBand(),
    msa_yScale = d3.scaleBand(),
    msa_colorScale = d3.scaleOrdinal(d3.schemeSet3),
    msa_lbl_width = 0,
    msa_lbl_height = 15,
    seq_ltr_width = 15;

const wide_chars = ['W', 'w', 'Q', 'q'];

init();

function init() {
    targetEle = d3.select(`#${targetID}`);
    totalWidth = targetEle.node().getBoundingClientRect().width;
    totalHeight = targetEle.node().getBoundingClientRect().height;
    margin = {  
                l:totalWidth*0.01, 
                r:totalWidth*0.01, 
                t:totalHeight*0.01, 
                b:totalHeight*0.01
            };
    width = totalWidth-margin.l-margin.r;
    height = totalHeight-margin.t-margin.b;

    diameter = width>height ? height:width;
    radius = 0.6*diameter;
    label_band_width = radius/4;

    targetSVG = targetEle.append("svg")
                        .attr("width", totalWidth)
                        .attr("height", totalHeight);

    targetG = targetSVG.append("g")
                .attr("class", "baseG")
                .attr("transform", `translate(${diameter/2},${diameter/2})`);

    legendG = targetSVG.append("g")
                .attr("transform", `translate(${0.78*width},${0})`);   

    targetSubView1Ele = d3.select(`#${targetSubView1ID}`);
    targetSubView1Width = targetSubView1Ele.node().getBoundingClientRect().width;
    targetSubView1Height = targetSubView1Ele.node().getBoundingClientRect().height;
    let pie_d = targetSubView1Width>targetSubView1Height ? 0.8*targetSubView1Height:0.8*targetSubView1Width;
    pie_outerR = pie_d/2;
    pie_innerR = 0.6*pie_outerR;
    arc.innerRadius(pie_innerR).outerRadius(pie_outerR);

    targetSubView1SVG = targetSubView1Ele.append("svg")
                            .attr("width", targetSubView1Width)
                            .attr("height", targetSubView1Height);

    targetSubView1G = targetSubView1SVG.append("g")
                        .attr("transform", `translate(${targetSubView1Width/2},${targetSubView1Height/2})`)

    msaViewEle = d3.select(`#${msaViewID}`);
    msaViewWidth = msaViewEle.node().getBoundingClientRect().width;
    msaViewHeight = msaViewEle.node().getBoundingClientRect().height;

    msaViewSVG = msaViewEle.append("svg")
                        .attr("width", msaViewWidth)
                        .attr("height", msaViewHeight);

    msaViewG = msaViewSVG.append("g")
                        .attr("transform", `translate(${0.01*msaViewWidth},${0.001*msaViewHeight})`);

    msaLblViewEle = d3.select(`#${msaLblViewID}`);
    msaLblViewWidth = msaLblViewEle.node().getBoundingClientRect().width;
    msaLblViewHeight = msaLblViewEle.node().getBoundingClientRect().height;

    msaLblViewSVG = msaLblViewEle.append("svg")
                        .attr("width", msaLblViewWidth)
                        .attr("height", msaLblViewHeight);

    msaLblViewG = msaLblViewSVG.append("g")
                        .attr("transform", `translate(${0.01*msaLblViewWidth},${0.001*msaLblViewHeight})`);

    msaLblConservationViewEle = d3.select(`#${msaLblConservationViewID}`);
    msaLblConservationViewWidth = msaLblConservationViewEle.node().getBoundingClientRect().width;
    msaLblConservationViewHeight = msaLblConservationViewEle.node().getBoundingClientRect().height;

    msaLblConservationViewSVG = msaLblConservationViewEle.append("svg")
                        .attr("width", msaLblConservationViewWidth)
                        .attr("height", msaLblConservationViewHeight);

    msaLblConservationViewG = msaLblConservationViewSVG.append("g")
                        .attr("transform", `translate(${0.01*msaLblConservationViewWidth},${0.01*msaLblConservationViewHeight})`);

    msaLblConservationViewAxis = msaLblConservationViewSVG.append("g")
                                    .attr("class", "msaConservationViewXAxis");
}

d3.select("#treeFile").on("change", function () {
    var f = event.target.files[0]
    var reader = new FileReader();

    reader.onload = function(event) {
        load_treeFile(event.target.result);
    };
    // Read in the file as a data URL.
    reader.readAsDataURL(f);
})

d3.select("#legendFile").on("change", function () {
    var f = event.target.files[0]
    var reader = new FileReader();

    reader.onload = function(event) {
        load_legendFile(event.target.result)
    };
    // Read in the file as a data URL.
    reader.readAsDataURL(f);
})

function load_legendFile(fileHandler) {
    d3.json(fileHandler).then(data =>{
        // legend = data
        Object.keys(data).forEach(d => {
            legend[d] = data[d]['color'];
            data[d]['nodes'].forEach(n => {
                labels[n] = data[d]['color'];
            })
        });
        setColor(root);
        updateTree();
        showLegend();
    });
}

function load_treeFile(fileHandler) {
    d3.text(fileHandler).then(d =>{
        data = parseNewick(d);
        displayTree();
    });
}

function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}

d3.select("#btnSubmit").on("click", function () {
});

function displayTree() {
    var reg=/^#([0-9a-f]{3}){1,2}$/i;

    let lineStroke = `#${d3.select("#lineColor").node().value}`;
    if(!reg.test(lineStroke))
        lineStroke = defaultStrokeColor;

    let cluster = d3.cluster();

    if (useRadial) {
        cluster.size([360, radius-padding-label_band_width])
                .separation((a, b) => 1); 
    } else {
        cluster.size([totalHeight, 0.7*totalWidth - label_band_width]);
    }

    root = d3.hierarchy(data, d => d.branchset)
                .sum(d => d.branchset ? 0 : 1)
                .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

    cluster(root);
    if (useRadial) {
        setRadius(root, root.data.length = 0, radius / maxLength(root));   
    }    
    setColor(root);

    targetG.append("g")
            .attr("fill", "none")
            .attr("stroke", lineStroke)
        .selectAll(".treeBranch")
        .data(root.links())
        .join("path")
            .each(function(d) { d.target.linkNode = this; })
            .attr("class", 'treeBranch')
            .attr("d", d3.select('#chkMaintainLength').property('checked') ? linkVariable : linkConstant)
            .attr("stroke", d => d.target.color)
            .on("mouseover", function(e,d) {
                d3.select(this).style("cursor", "pointer"); 
            })
            .on("mouseout", function(e,d) {
                d3.select(this).style("cursor", "default"); 
            })
            .on('click', branchClicked);

    targetG.append("g")
        .selectAll(".nodeLabel")
        .data(root.leaves())
        .join("text")
            .attr("dy", ".31em")
            .attr("class", "nodeLabel")
            .attr("transform", d => {
                    if (useRadial) {
                        return `rotate(${d.x - 90}) translate(${radius-label_band_width},0)${d.x < 180 ? "" : " rotate(180)"}`
                    } else {
                        return `translate(${d.y+5},${d.x})`
                    } 
                })
            .attr("text-anchor", d => {
                if (useRadial) {
                    return d.x < 180 ? "start" : "end";                    
                } else {
                    return "start";
                }
            })
            .attr("fill", d => d.color)
            .text(d => d.data.name.replace(/_/g, " "));

    showLegend();
    
}

function updateTree() {
    targetG.selectAll(".nodeLabel")
        .attr("fill", d => d.color);
    
    targetG.selectAll(".treeBranch")
        .attr("stroke", d => d.target.color);
    
}

// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(d => setRadius(d, y0, k));
}

// Set the color of each node by recursively inheriting.
function setColor(d) {
    let name = d.data.name;
        d.color = labels[name];
    if (d.children) d.children.forEach(setColor);
}

// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
}

function linkExtensionConstant(d) {
    return linkStep(d.target.x, d.target.y, d.target.x, radius);
}

function linkConstant(d) {
    if (useRadial) {
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    } else {
        return "M" + d.source.y + "," + d.source.x
            + "L" + d.source.y + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    } 
}

function linkVariable(d) {
    if (useRadial) {
        return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    } else {
        return "M" + d.source.y + "," + d.source.x
            + "L" + d.source.y + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    } 
}

function linkStep(startAngle, startRadius, endAngle, endRadius) {
    const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
    const s0 = Math.sin(startAngle);
    const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
    const s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
}

function showLegend() {
    const g = legendG.selectAll("g")
                .data(Object.keys(legend))
                .join("g")
                    .attr("transform", (d, i) => `translate(0,${10+(i) * 20})`);

    g.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", d => legend[d]);

    g.append("text")
        .attr("class", "legendLabel")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => {
            if (d.includes('ExperimentalF')) {
                return `${d} (EF)`;
            } else if (d.includes('ExperimentalUnf')) {
                return `${d} (EU)`;
            } else if (d.includes('GeneratedF')) {
                return `${d} (GF)`;
            } else if (d.includes('GeneratedUnf')) {
                return `${d} (GU)`;
            }
        });
}

d3.select('#lineColor').on('mouseout', function () {
    defaultStrokeColor = `#${d3.select(this).property("value")}`;
    console.log(defaultStrokeColor);
})

d3.select('#chkMaintainLength').on("change", function () {
    const t = d3.transition().duration(750);
    d3.selectAll('.treeBranch').transition(t).attr('d', d3.select('#chkMaintainLength').property('checked') ? linkVariable : linkConstant);
    d3.selectAll('.nodeLabel').transition(t).attr("transform", (d) => {
        if (d3.select('#chkMaintainLength').property('checked')) {
            return `rotate(${d.x - 90}) translate(${d.radius+padding},0)${d.x < 180 ? "" : " rotate(180)"}`;
        }
        return `rotate(${d.x - 90}) translate(${radius-label_band_width},0)${d.x < 180 ? "" : " rotate(180)"}`;
    })
})

d3.select('#chkRadial').on("change", function () {
    useRadial = !useRadial

    targetSVG.select('.baseG').remove();

    if (useRadial) {
        targetG = targetSVG.append("g")
                .attr("class", "baseG")
                .attr("transform", `translate(${diameter/2},${diameter/2})`)
    } else {
        targetG = targetSVG.append("g")
                .attr("class", "baseG")
                .attr("transform", `translate(5,5)`);
    }
    displayTree();
})

function branchClicked(e,d) {
    d3.selectAll(".treeBranch")
        .attr("stroke", d => d.target.color)
        .style('stroke-width', 1);
    d3.select(this)
        .attr("stroke", "black")
        .style('stroke-width', 3);
    let leaves = d.target.leaves().map(l => l.data.name);
    selected_data = {'GeneratedFit':0, 'GeneratedUnfit':0, 'ExperimentalFit':0, 'ExperimentalUnfit':0};
    pie_data = []

    leaves.forEach(l => {
        if (l.includes('genF')) {
            selected_data['GeneratedFit']+=1;
        } else if (l.includes('genUnf')) {
            selected_data['GeneratedUnfit']+=1;
        } else if (l.includes('trainF')) {
            selected_data['ExperimentalFit']+=1;
        } else if (l.includes('trainUnf')) {
            selected_data['ExperimentalUnfit']+=1;
        }
    })
    
    Object.keys(selected_data).forEach(ele => {
        pie_data.push({'k':ele, 'v': selected_data[ele]});
    });
  
    updatePie();
    msaViewG.selectAll(".msa_ele").remove();
    msaLblViewG.selectAll(".msa_lbl").remove();
    msaLblConservationViewG.selectAll("*").remove()
    computeMSA(d.target, d.target.leaves(), selected_data);

    let horizontal_divs = document.querySelectorAll('.sync_hor_div'),
        vertical_divs = document.querySelectorAll('.sync_ver_div');

    horizontal_divs.forEach(div => div.addEventListener( 'scroll', e => 
        {
            horizontal_divs.forEach(d => {
                d.scrollLeft = div.scrollLeft;
            });
        }) 
    );

    vertical_divs.forEach(div => div.addEventListener( 'scroll', e => 
        {
            vertical_divs.forEach(d => {
                d.scrollTop = div.scrollTop;
            });
        }) 
    );
}

function updatePie() {
    // console.log(pie(pie_data));
    targetSubView1G.selectAll(".slice")
        .data(pie(pie_data))
        .join("path")
            .attr("class", 'slice')
            .attr("d", arc)
            .attr("fill", d => legend[d.data.k])
            .attr("stroke", "none");

    targetSubView1G.selectAll(".sliceText")
        .data(pie(pie_data))
        .join("text")
            .attr('transform', d => 'translate(' + arc.centroid(d) + ')')
            .attr("class", 'sliceText')
            .text(d => {
                if (Math.abs(d.startAngle-d.endAngle)>0.1) {
                    return d.data.v;
                } else {
                    return "";
                }
            })
}

function computeMSA(cur_node, leaf_nodes, lbl_cls_counts) {
    selected_lbl_cls = '';
    ref_lbl = '';
    leaf_lbls = leaf_nodes.map(n => n.data.name);

    if (lbl_cls_counts.ExperimentalFit!=0 || lbl_cls_counts.ExperimentalUnfit!=0) {
        selected_lbl_cls = lbl_cls_counts.ExperimentalFit>=lbl_cls_counts.ExperimentalUnfit ? "trainF" : "trainUnf";
    } else {
        selected_lbl_cls = lbl_cls_counts.GeneratedFit>=lbl_cls_counts.GeneratedUnfit ? "genF" : "genUnf";
    }
    leaf_nodes = leaf_nodes.filter(n => n.data.name.includes(selected_lbl_cls));
    let leaf_nodes_by_order = leaf_nodes.sort((a,b) => {
        if (a.depth-cur_node.depth<b.depth-cur_node.depth) {
            return -1;
        } else if (a.depth-cur_node.depth>b.depth-cur_node.depth){
            return 1;
        } else {
            return 0;
        }
    })
    ref_lbl = leaf_nodes_by_order[0].data.name;

    $.ajax({
        type:'POST',
        url:'runMSA',
        data:{'labels':JSON.stringify(leaf_lbls), 'ref_label':ref_lbl},
        success: function(response) {
            updateMSA(JSON.parse(response.data));
        },
        error: function(response) {
            console.log(response);
        }

    });
}

function updateMSA(msa_data) {
    let view_height = msa_lbl_height * (msa_data.length+1),
        seq_width = seq_ltr_width * (msa_data[0][1].length+1),
        view_width = seq_width;

    msaViewSVG.attr("height", view_height).attr("width", view_width);  
    msaLblViewSVG.attr("height", view_height);
    msaLblConservationViewSVG.attr("width", view_width);
    
    msa_yScale.domain(msa_data.map(d => d[0])).range([0.01*msaViewHeight,view_height-msa_lbl_height]).paddingOuter(0.05);

    msaViewG.selectAll(".msa_ele")
        .data(msa_data)
        .enter().append("g")
            .attr("class", "msa_ele");

    msaLblViewG.selectAll(".msa_lbl")
        .data(msa_data)
        .join("text")
            .attr("class", "msa_lbl")
            .attr("x", 0.99*msaLblViewWidth)
            .attr("y", d => msa_yScale(d[0])+msa_yScale.bandwidth()/2)
            .attr("dy", ".31em")
            .text(d => {
                if (d[0].includes('genF')) {
                    return 'GF';
                } else if (d[0].includes('genUnf')) {
                    return 'GU';
                } else if (d[0].includes('trainF')) {
                    return 'EF';
                } else if (d[0].includes('trainUnf')) {
                    return 'EU';
                }
                return d[0];
            });

    msaViewG.selectAll(".msa_ele").each(function(d,j) {
        msa_xScale.domain(Array.from(Array(d[1].length).keys())).range([0,view_width-0.01*msaViewWidth]).paddingOuter(0.01);

        d3.select(this).append("g")
            .selectAll(`.rect_${d[0]}`)
                .data(d[1])
                .join("rect")
                    .attr("class", `rect_${d[0]} msa_seq_rect`)
                    .attr("x", (k,i) => msa_xScale(i))
                    .attr("y", msa_yScale(d[0]))
                    .attr("width", msa_xScale.bandwidth())
                    .attr("height", msa_lbl_height)
                    .attr("fill", k => {
                        return k=="-"? "#fff" : msa_colorScale(k)
                    });

        d3.select(this).append("g")
            .selectAll(`.ltrs_${d[0]}`)
                .data(d[1])
                .join("text")
                    .attr("dy", ".31em")
                    .attr("class", `ltrs_${d[0]} msa_seq_letter`)
                    .attr("x", (k,i) => msa_xScale(i)+msa_xScale.bandwidth()/2)
                    .attr("y", msa_yScale(d[0])+msa_yScale.bandwidth()/2)
                    .text(k => k);
    })

    let msa_conservation_data = [];
    [...msa_data[0][1]].forEach(() => msa_conservation_data.push({}));
    msa_data.forEach(d => {
        [...d[1]].forEach((l,i) => {
            if (l in msa_conservation_data[i])
                msa_conservation_data[i][l] +=1
            else
                msa_conservation_data[i][l] =1
        })
    })
      
    msaLblConservationViewG.selectAll(".msa_conservation_ele")
        .data(msa_conservation_data)
        .enter().append("g")
            .attr("class", "msa_conservation_ele");
    let msa_conservation_xScale = d3.scaleBand()
                                    .domain(Array.from(Array(msa_conservation_data.length).keys()))
                                    .range([0,view_width-0.01*msaViewWidth]).paddingOuter(0.01),
        msa_conservation_startY = 0.01*msaLblConservationViewHeight,
        msa_conservation_endY = msa_conservation_startY+0.8*msaLblConservationViewHeight,
        msa_conservation_fontYScale = d3.scaleLinear().range([3,20]).domain([0, msa_data.length]),
        msa_conservation_fontXScale = d3.scaleLinear().range([5,1]).domain([0, msa_data.length]);
    msaLblConservationViewG.selectAll(".msa_conservation_ele").each(function(d,j) {
        let sel = d3.select(this),
            conservation_data = Object.keys(d).map((key) => [key, d[key]]),
            stackData = [],
            msa_conservation_yScale = d3.scaleLinear();
        
        conservation_data = conservation_data.sort((a,b) => {
                                                    return a[1]>b[1] ? -1 :1 ;
                                                });
        conservation_data.forEach((k,l) => {
            l==0 ? stackData.push([0,k[1]]) : stackData.push([stackData[l-1][1], stackData[l-1][1]+k[1]]);
        })
        msa_conservation_yScale
            .domain([0, stackData.slice(-1)[0][1]])
            .range([msa_conservation_startY,msa_conservation_endY]);

        sel.selectAll(`.ltrs_conservation_rect_${j}`)
            .data(conservation_data)
            .join("rect")
                .attr("class", `ltrs_conservation_rect_${j}`)
                .attr("x", msa_conservation_xScale(j))
                .attr("y", (k,l) => msa_conservation_yScale(stackData[l][0]))
                .attr("width", msa_conservation_xScale.bandwidth())
                .attr("height", (k,l) => msa_conservation_yScale(stackData[l][1]) - msa_conservation_yScale(stackData[l][0]))
                .attr("fill", k => {
                    return k[0]=="-"? "#fff" : msa_colorScale(k[0])
                })

        sel.selectAll(`.ltrs_conservation_${j}`)
            .data(conservation_data)
            .join("text")
                .attr("class", `ltrs_conservation_${j} msa_letter_conservation`)
                .attr("dy", "-0.025em")
                .attr("transform", (k,l) => {
                    const x = msa_conservation_xScale(j) + msa_conservation_xScale.bandwidth()/2,
                          y = msa_conservation_yScale(stackData[l][0]) + (msa_conservation_yScale(stackData[l][1]) - msa_conservation_yScale(stackData[l][0]))/2; 
                    return `translate(${x}, ${y})`
                })
                .attr("fill", k => {
                    return k[0]=="-"? "#fff" : "#000"
                })
                .attr("YFontScale", k => msa_conservation_fontYScale(k[1]))
                .attr("XFontScale", k => {
                    return wide_chars.includes(k[0]) ? msa_conservation_fontXScale(k[1])/2 : msa_conservation_fontXScale(k[1]);
                })
                .style("font-size", k =>msa_conservation_fontYScale(k[1]))
                .text(k=>k[0])
                .each(updateFontSize);
        
    })

    msaLblConservationViewAxis.attr("transform", `translate(${0.01*msaLblConservationViewWidth},${msa_conservation_endY})`)
        .call(d3.axisBottom(msa_conservation_xScale)
                .tickValues(msa_conservation_xScale.domain().filter((item) => item%5==0)));

    function updateFontSize(d) {
        const l = d3.select(this);
        // const tr = l.attr("transform");
        const [tr, ,] = String(l.attr("transform")).match(/(\d+).*,*(\d+)/) || [];
        const ky = +l.attr("YFontScale")*0.25;
        const kx = +l.attr("XFontScale");
        const tr_components = tr.split(', ');
        l.attr("font-size", "20"); // 30% more than the width of a column
        // l.attr("dy", "-0.05em");
        l.attr("transform", `translate(${tr_components[0]},${tr_components[1]}) scale(${kx},${ky})`);
    }
}