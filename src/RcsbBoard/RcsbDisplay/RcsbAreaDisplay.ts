import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {RcsbLineDisplay} from "./RcsbLineDisplay";
import {area, Area, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {INTERPOLATION_TYPES} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {BaseType, Selection} from "d3-selection";
import {MoveAreaInterface, PlotAreaInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3AreaManager";
import {RcsbFvDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbAreaDisplay extends RcsbLineDisplay implements RcsbDisplayInterface{
    area: Area<RcsbFvDataElementInterface> = area<RcsbFvDataElementInterface>().curve(curveStep);

    setInterpolationType(type: string): void{
        super.setInterpolationType(type);
        if(type === INTERPOLATION_TYPES.CARDINAL)
            this.area = area<RcsbFvDataElementInterface>().curve(curveCardinal);
        else if(type === INTERPOLATION_TYPES.STEP)
            this.area = area<RcsbFvDataElementInterface>().curve(curveStep);
        else if(type === INTERPOLATION_TYPES.BASIS)
            this.area = area<RcsbFvDataElementInterface>().curve(curveBasis);
        else if(type === INTERPOLATION_TYPES.LINEAR)
            this.area = area<RcsbFvDataElementInterface>().curve(curveLinear);
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

    plot(elements:Selection<SVGGElement,RcsbFvDataElementInterface,BaseType,undefined>): void {
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
