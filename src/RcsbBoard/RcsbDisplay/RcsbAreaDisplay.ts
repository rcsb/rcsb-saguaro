import {RcsbDisplayInterface} from "./RcsbDisplayInterface";
import {RcsbLineDisplay} from "./RcsbLineDisplay";
import {area, Area, curveStep, curveCardinal, curveBasis, curveLinear} from "d3-shape";
import {InterpolationTypes} from "../../RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {BaseType, Selection} from "d3-selection";
import {MoveAreaInterface, PlotAreaInterface} from "../RcsbD3/RcsbD3DisplayManager/RcsbD3AreaManager";
import {RcsbFvTrackDataElementInterface} from "../../RcsbFv/RcsbFvDataManager/RcsbFvDataManager";

export class RcsbAreaDisplay extends RcsbLineDisplay implements RcsbDisplayInterface{
    private area: Area<RcsbFvTrackDataElementInterface> = area<RcsbFvTrackDataElementInterface>().curve(curveStep);

    setInterpolationType(type: string): void{
        super.setInterpolationType(type);
        if(type === InterpolationTypes.CARDINAL)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveCardinal);
        else if(type === InterpolationTypes.STEP)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveStep);
        else if(type === InterpolationTypes.BASIS)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveBasis);
        else if(type === InterpolationTypes.LINEAR)
            this.area = area<RcsbFvTrackDataElementInterface>().curve(curveLinear);
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

    plot(elements:Selection<SVGGElement,RcsbFvTrackDataElementInterface,BaseType,undefined>): void {
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
