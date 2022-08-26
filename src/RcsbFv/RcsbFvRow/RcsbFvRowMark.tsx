import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

export interface RcsbFvRowMarkInterface  {
    readonly isGlowing: boolean;
    externalComponent?: ExternalComponentType;
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

type ExternalComponentType = typeof ExternalComponent;
abstract class ExternalComponent extends React.Component<{isGlowing:boolean}, any>{
    protected constructor(props: any) {
        super(props);
    }
}

export class RcsbFvRowMark extends React.Component <RcsbFvRowMarkInterface,{}> {

    public render(): JSX.Element {
        const ExternalComponent: ExternalComponentType | undefined = this.props.externalComponent;
        return (<div className={classes.rcsbFvRowMark} style={{display:"inline-block"}}>
            <div>
                {
                    ExternalComponent ? <ExternalComponent isGlowing={this.props.isGlowing} /> : (
                        <div onClick={this.props.clickCallback} onMouseOver={this.props.hoverCallback} style={{width:6, height:6, marginBottom: 4, marginRight:5}} >
                            <div className={classes.rcsbFvRowMarkComponent}/>
                        </div>
                    )
                }
            </div>
        </div>);
    }

}