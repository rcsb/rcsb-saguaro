import * as React from "react";
import * as classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

export interface RcsbFvUIHelpInterface {
    boardId: string;
}

export class RcsbFvUIHelp extends React.Component<RcsbFvUIHelpInterface, any> {

    render(): JSX.Element{
        return (<div id={this.props.boardId+"_zoomHelp"} className={classes.rcsbZoomHelp+" "+classes.rcsbSmoothDivHide}>
            <div><b>ZOOM</b></div>
            <div style={{marginTop:5}}><b>Mouse</b>: scroll the wheel up to zoom in (scroll down to zoom out)</div>
            <div style={{marginTop:5}}><b>Trackpad</b>: scroll gesture (macOS: place two fingers on your trackpad and move them down or up to zoom in or out)</div>
        </div>);
    }

}
