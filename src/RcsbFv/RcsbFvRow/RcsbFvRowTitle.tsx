import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";

interface RcsbFvRowTitleInterface {
    data: RcsbFvRowConfigInterface;
    rowTitleHeight: number;
}

export class RcsbFvRowTitle extends React.Component <RcsbFvRowTitleInterface, {}> {

    configData : RcsbFvRowConfigInterface = null;
    private readonly PADDING_RIGHT: number = 5;

    constructor(props: RcsbFvRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
        this.state = {

        };
    }

    render(){
        const height: number = (this.configStyle().height as number);
        if(typeof this.configData.rowPrefix === "string" && this.configData.rowPrefix.length > 0){
            const prefixWidth: number = Math.round(((this.configData.rowPrefix.length/this.configData.rowPrefix.concat(this.configData.rowTitle).length)*(this.configStyle().width as number)));
            const titleWidth: number = (this.configStyle().width as number)-prefixWidth;
            return (
                <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                    {
                        this.setTitle() != null ? <div style={this.configProvenanceStyle()}
                                                       className={classes.rcsbFvRowTitleProvenanceFlag}/> : null
                    }
                    <div style={{width:titleWidth,height:height,paddingRight:this.PADDING_RIGHT}}><div style={{lineHeight:height+"px"}}>{this.setTitle()}</div></div>
                    <div style={{height:height}}><div style={{lineHeight:height+"px"}}>{this.configData.rowPrefix}</div></div>
                </div>
            );
        }else {
            return (
                <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                    {
                        this.setTitle() != null ? <div style={this.configProvenanceStyle()}
                                                       className={classes.rcsbFvRowTitleProvenanceFlag}/> : null
                    }
                    <div style={{paddingRight:this.PADDING_RIGHT}}><div style={{lineHeight:height+"px"}}>{this.setTitle()}</div></div>
                </div>
            );
        }
    }

    setTitle(): string {
        if(typeof this.configData.rowTitle === "string"){
            return this.configData.rowTitle;
        }
        return null;
    }

    configStyle() : React.CSSProperties {
        let width : number = RcsbFvDefaultConfigValues.rowTitleWidth;
        if(typeof this.configData.rowTitleWidth === "number"){
            width = this.configData.rowTitleWidth;
        }
        return {
            width: width,
            height: this.props.rowTitleHeight
        };
    }

    configProvenanceStyle():React.CSSProperties {
        let color: string = "#FFFFFF";
        if(typeof this.props.data.titleFlagColor === "string"){
            color = this.props.data.titleFlagColor;
        }
        return {
            backgroundColor: color,
            borderColor: color,
            height: this.props.rowTitleHeight,
            width: this.PADDING_RIGHT,
            float:"right"
        };
    }
}
