import * as React from "react";
import classes from "../RcsbFvStyles/RcsbFvRow.module.scss";

export interface RcsbFvRowMarkInterface extends RcsbFvRowMarkPublicInterface{
    isGlowing: boolean;
}

export interface RcsbFvRowMarkPublicInterface extends RcsbFvRowMarkCallbackInterface {
    externalComponent?: ExternalComponentType;
}

interface RcsbFvRowMarkCallbackInterface {
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

type ExternalComponentType = typeof ExternalComponent;
abstract class ExternalComponent extends React.Component<{isGlowing:boolean} & RcsbFvRowMarkCallbackInterface, any>{
    protected constructor(props: Readonly<{ isGlowing: boolean } & RcsbFvRowMarkCallbackInterface>) {
        super(props);
    }
}

export class RcsbFvRowMark extends React.Component <RcsbFvRowMarkInterface,{}> {

    public render(): JSX.Element {
        const ExternalComponent: ExternalComponentType | undefined = this.props.externalComponent;
        return (<div className={classes.rcsbFvRowMark} style={{display:"inline-block"}}>
            <div>
                {
                    ExternalComponent ? <ExternalComponent isGlowing={this.props.isGlowing} clickCallback={this.props.clickCallback} hoverCallback={this.props.hoverCallback}/> : (
                        <div onClick={this.props.clickCallback} onMouseOver={this.props.hoverCallback} style={{width:6, height:6, marginBottom: 4, marginRight:5}} >
                            <div className={classes.rcsbFvRowMarkComponent}/>
                        </div>
                    )
                }
            </div>
        </div>);
    }

}