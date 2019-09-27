import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {RcsbLineDisplay} from "./RcsbLineDisplay";
import * as classes from "../scss/RcsbBoard.module.scss";
import {area, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {INTERPOLATION_TYPES} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {BaseType, Selection} from "d3-selection";
import {MoveAreaInterface, PlotAreaInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3AreaManager";

export class RcsbAreaDisplay extends RcsbLineDisplay implements RcsbDisplayInterface{
    area = area().curve(curveStep);

    setInterpolationType(type: string): void{
        super.setInterpolationType(type);
        if(type === INTERPOLATION_TYPES.CARDINAL)
            this.area = area().curve(curveCardinal);
        else if(type === INTERPOLATION_TYPES.STEP)
            this.area = area().curve(curveStep);
        else if(type === INTERPOLATION_TYPES.BASIS)
            this.area = area().curve(curveBasis);
        else if(type === INTERPOLATION_TYPES.LINEAR)
            this.area = area().curve(curveLinear);
    }

    private setArea(): void{
        this.area
            .x(this.line.x())
            .y1(this.line.y())
            .y0(this._height);
    }

    private updateArea(): void{
        this.updateFunction();
        this.area.x(this.line.x());
    }

    plot(elements:Selection<SVGGElement,any,BaseType,undefined>): void {
        if(!this.definedScale)
            this.setScale();
        this.linePoints = this.downSampling(elements.data());
        elements.remove();
        this.setArea();
        const config: PlotAreaInterface = {
            points: this.linePoints,
            color: this._displayColor,
            trackG: this.g,
            area: this.area,
        };
        this.d3Manager.plotAreaDisplay(config);
    }

    move(): void{
        this.updateArea();
        const config: MoveAreaInterface = {
            points: this.linePoints,
            trackG: this.g,
            area: this.area,
        };
        this.d3Manager.moveAreaDisplay(config);
    }
}
