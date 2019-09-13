import {d3} from "d3";
import * as classes from "./scss/RcsbFvRow.module.scss";

export class RcsbBoard {
    domId: string = null;
    _width: number = 920;
    _svg: any = null;

    constructor(elementId: string){
        this.domId  = elementId;
        const domD3:Selection<HTMLElement,unknown,BaseType,unknown> = d3.select(document.getElementById(elementId));
        domD3.classed(classes.rcsbBoard, true)
            .style("_width", this._width );

    	this._svg = domD3.append("svg")
    	    .attr("class", "tnt_svg")
    	    .attr("width", this._width)
    	    .attr("pointer-events", "all")
            .on("contextmenu",function(){
                d3.event.preventDefault();
            });


    	svg_g = svg
    	    .append("g")
            .attr("class", "tnt_master_g")
            .append("g")
    	    .attr("class", "tnt_g")
            .on("dblclick",function(){
                track_vis.select_region(null,null,false);
            })
    	    .on("mousedown",function(){
                if(d3.event.which === 3) {
                    d3.event.stopImmediatePropagation();
                }
    	        brush_selection.mousedown.call(this,track_vis,svg_g,xScale);
            })
            .on("mouseup",function(){
                if(d3.event.which === 3) {
                    d3.event.stopImmediatePropagation();
                }
                brush_selection.mouseup.call(this,track_vis,svg_g,xScale);
            });

    	// The Zooming/Panning Pane
    	pane = svg_g
    	    .append("rect")
    	    .attr("class", "tnt_pane")
    	    .attr("id", "tnt_" + div_id + "_pane")
    	    .attr("width", width)
    	    .style("fill", bgColor)
    }
}