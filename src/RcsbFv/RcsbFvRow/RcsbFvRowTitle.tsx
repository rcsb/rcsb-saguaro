import * as React from "react";
import {RcsbFvDefaultConfigValues} from "../RcsbFvConfig/RcsbFvDefaultConfigValues";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";
import {RcsbFvRowConfigInterface} from "../RcsbFvConfig/RcsbFvConfigInterface";
import {ReactElement} from "react";

/**Board track title cell React component interface*/
interface RcsbFvRowTitleInterface {
    data: RcsbFvRowConfigInterface;
    rowTitleHeight: number;
}

export class RcsbFvRowTitle extends React.Component <RcsbFvRowTitleInterface, {}> {

    configData : RcsbFvRowConfigInterface;
    private readonly PADDING_RIGHT: number = 5;

    constructor(props: RcsbFvRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
        this.state = {

        };
    }

    render(){
        const height: number = (this.configStyle().height as number);
        const trackTitle: string = typeof this.configData?.rowTitle === "string" ? this.configData.rowTitle : (typeof this.configData?.rowTitle === "object" ? this.configData.rowTitle.visibleTex : "");
        if(typeof this.configData.rowPrefix === "string" && this.configData.rowPrefix.length > 0 && this.configData.fitTitleWidth){
            const prefixWidth: number = Math.round(((this.configData.rowPrefix.length/this.configData.rowPrefix.concat(trackTitle).length)*(this.configStyle().width as number)));
            const titleWidth: number = (this.configStyle().width as number)-prefixWidth;
            const style: React.CSSProperties = {width:titleWidth,height:height,paddingRight:this.PADDING_RIGHT};
            return (
                <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                    {
                        this.setTitle() != null ? <div style={this.configTitleFlagColorStyle()}
                                                       className={classes.rcsbFvRowTitleProvenanceFlag}/> : null
                    }
                    <div style={{...style, float:"right", display:"inline-block"}}><div className={classes.rcsbFvRowTitleText} style={{lineHeight:height+"px"}}>{this.setTitle()}</div></div>
                    <div style={{height:height, float:"right", display:"inline-block"}}><div className={classes.rcsbFvRowTitleText}  style={{lineHeight:height+"px"}}>{this.configData.rowPrefix}</div></div>
                </div>
            );
        }else if(typeof this.configData.rowPrefix === "string" && this.configData.rowPrefix.length > 0){
            return (
                <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                    {
                        this.setTitle() != null ? <div style={this.configTitleFlagColorStyle()}
                                                       className={classes.rcsbFvRowTitleProvenanceFlag}/> : null
                    }
                    <div className={classes.rcsbFvRowTitleText} style={{lineHeight:height+"px", paddingRight:this.PADDING_RIGHT}}>{this.configData.rowPrefix+" "}{this.setTitle()}</div>
                </div>
            );
        }else {
            return (
                <div className={classes.rcsbFvRowTitle} style={this.configStyle()}>
                    {
                        this.setTitle() != null ? <div style={this.configTitleFlagColorStyle()}
                                                       className={classes.rcsbFvRowTitleProvenanceFlag}/> : null
                    }
                    <div className={classes.rcsbFvRowTitleText} style={{lineHeight:height+"px", paddingRight:this.PADDING_RIGHT}}>{this.setTitle()}</div>
                </div>
            );
        }
    }

    /**
     * @return Title string defined in the track configuration object
     * */
    setTitle(): string | null | ReactElement {
        if(typeof this.configData.rowTitle === "string"){
            return this.configData.rowTitle;
        }else if(typeof this.configData.rowTitle === "object"){
            const target: string = this.configData.rowTitle.isThirdParty ? "_blank" : "_self";
            if(typeof this.configData.rowTitle.url === "string")
                return (<a href={this.configData.rowTitle.url} target={target} style={this.configData.rowTitle.style}>{this.configData.rowTitle.visibleTex}</a>);
            else
                return (<span style={this.configData.rowTitle.style}>{this.configData.rowTitle.visibleTex}</span>);
        }
        return null
    }

    /**
     * @return CSS style width and height for the cell
     * */
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

    /**
     * @return Title flag color css style properties
     * */
    configTitleFlagColorStyle():React.CSSProperties {
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
