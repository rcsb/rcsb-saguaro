import * as React from "react";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {ScaleLinear} from "d3-scale";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";

import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

/**Board track React component interface*/
interface RcsbFvRowUInterface {
    readonly contextManager: RcsbFvContextManager;
    readonly xScale: ScaleLinear<number,number>;
    readonly length?: number;
}

export class RcsbFvRowUI extends React.Component <RcsbFvRowUInterface> {

    /**Zoom button variation*/
    private readonly deltaZoom: number = 25;

    render() {
        return (
            <div>
                <div className={classes.rcsbFvZoomButton} onClick={this.zoomIn.bind(this)}>+</div>
                <div className={classes.rcsbFvZoomButton} onClick={this.zoomOut.bind(this)}>&ndash;</div>
            </div>
        );
    }
    /**Force all board track annotation cells to set xScale. Called when a new track has been added*/
    private setScale(): void{
        if(this.props.xScale!=null) {
            this.props.contextManager.next({
                eventType: EventType.SCALE,
                eventData: "UI"
            } as RcsbFvContextManagerInterface);
        }
    }

    /**Update d3 xScale domain
     * @param domain new xScale domain
     * */
    /**Update d3 xScale domain*/
    private setDomain(d:[number,number]): void {
        this.props.xScale.domain(d);
        this.setScale();
    }

    private zoomIn(): void {
        if( this.props.length == null)
            return;
        const currentDomain: Array<number> = this.props.xScale.domain();
        const x: number = currentDomain[0]+this.deltaZoom;
        const y: number = currentDomain[1]-this.deltaZoom;
        if( (y-x)>20)
            this.setDomain([x,y]);
    }

    private zoomOut(): void {
        if( this.props.length == null)
            return;
        const length: number = this.props.length;
        const currentDomain: Array<number> = this.props.xScale.domain();
        const x: number = currentDomain[0]-this.deltaZoom > (1-RcsbFvDefaultConfigValues.increasedView) ? currentDomain[0]-this.deltaZoom : (1-RcsbFvDefaultConfigValues.increasedView);
        const y: number = currentDomain[1]+this.deltaZoom < this.props.length+RcsbFvDefaultConfigValues.increasedView ? currentDomain[1]+this.deltaZoom : this.props.length+RcsbFvDefaultConfigValues.increasedView;
        if( (y-x) < (length+RcsbFvDefaultConfigValues.increasedView))
            this.setDomain([x,y]);
        else
            this.setDomain([(1-RcsbFvDefaultConfigValues.increasedView),this.props.length+RcsbFvDefaultConfigValues.increasedView]);
    }
}

