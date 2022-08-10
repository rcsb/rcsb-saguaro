import {scaleLinear, ScaleLinear, scalePoint, ScalePoint} from "d3-scale";

export interface RcsbScaleInterface<T=number,S=ScaleLinear<number,number>> {
    (x: T): number;
    _domain: [number,number];
    _range: [number,number];
    domain(x: T[]): RcsbScaleInterface;
    domain(): T[];
    range(x: number[]): RcsbScaleInterface;
    range(): number[];
    invert(x: number): T;
    checkAndSetScale(domain:[number,number],range:[number,number]): boolean;
    getScale(): S;
    reset(): void;
}

export namespace RcsbScaleFactory {

    export function getLinearScale(): RcsbScaleInterface {
        const xScale: ScaleLinear<number,number> = scaleLinear();
        const scale: RcsbScaleInterface = ((x: number)=>xScale(x)) as RcsbScaleInterface;
        scale.domain = xScale.domain as unknown as RcsbScaleInterface['domain'];
        scale.range = xScale.range as unknown as RcsbScaleInterface['range'];
        scale.invert = xScale.invert;
        scale.getScale = ()=>xScale;
        scale._domain = [0,0];
        scale._range = [0,0];
        scale.checkAndSetScale = (domain:[number,number],range:[number,number]) => {
            if(domain[0] == scale._domain[0] && domain[1] == scale._domain[1] && range[0] == scale._range[0] && range[1] == scale._range[1]){
                return true;
            }else{
                scale._domain = domain;
                scale._range = range;
                scale.domain(domain).range(range);
                return false;
            }
        };
        scale.reset = () => {
            scale._domain = [0,0];
            scale._range = [0,0];
        };
        return scale;
    }

    export function getPointScale(): RcsbScaleInterface<string,ScalePoint<string>> {
        const xScale: ScalePoint<string> = scalePoint();
        const scale: RcsbScaleInterface<string,ScalePoint<string>> = ((x: string)=>xScale(x)) as RcsbScaleInterface<string,ScalePoint<string>>;
        scale.domain = xScale.domain as unknown as RcsbScaleInterface<string,ScalePoint<string>>['domain'];
        scale.range = xScale.range as unknown as RcsbScaleInterface<string,ScalePoint<string>>['range'];
        scale.getScale = ()=>xScale;
        return scale;
    }

}