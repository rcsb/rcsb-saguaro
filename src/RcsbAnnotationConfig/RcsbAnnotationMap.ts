import * as annotationMap from "./RcsbAnnotationMap.json";
import {Annotation} from "../RcsbGraphQL/RcsbAnnotationInterface";

export interface RcsbAnnotationMapInterface {
    type: string;
    display: string;
    color: string;
    title: string;
    key?: string;
}

interface DynamicKeyAnnotationInterface extends Annotation{
    [key: string]: any;
}

export class RcsbAnnotationMap {
    private annotationMap: Map<string,RcsbAnnotationMapInterface> = new Map<string, RcsbAnnotationMapInterface>();
    private readonly uniprotAnnotationsOrder: Array<string> = new Array<string>();
    private readonly instanceAnnotationsOrder: Array<string> = new Array<string>();
    private readonly entityAnnotationsOrder: Array<string> = new Array<string>();

    constructor() {
        const config: Array<RcsbAnnotationMapInterface> = (<any>annotationMap).config;
        config.forEach(m=>{
            this.annotationMap.set(m.type,m);
        });
        this.uniprotAnnotationsOrder = (<any>annotationMap).uniprot_order;
        this.instanceAnnotationsOrder = (<any>annotationMap).instance_order;
        this.entityAnnotationsOrder = (<any>annotationMap).entity_order;
    }

    getConfig(type: string): RcsbAnnotationMapInterface{
        if(this.annotationMap.has(type)){
            return this.annotationMap.get(type);
        }
        return null;
    }

    allTypes(): Set<string>{
        const concat: Array<string> = this.uniprotAnnotationsOrder.concat(this.instanceAnnotationsOrder).concat(this.entityAnnotationsOrder);
        return new Set(concat);
    }

    uniprotOrder(): Array<string>{
        return this.uniprotAnnotationsOrder;
    }

    instanceOrder(): Array<string>{
        return this.instanceAnnotationsOrder;
    }

    entityOrder(): Array<string>{
        return this.entityAnnotationsOrder;
    }

    setAnnotationKey(d: Annotation): string{
        const type: string = d.type;
        const a: DynamicKeyAnnotationInterface = d;
        if(this.annotationMap.has(type) && this.annotationMap.get(type).key!=null && a[this.annotationMap.get(type).key]){
            const newType: string = type+":"+a[this.annotationMap.get(type).key];
            if(!this.annotationMap.has(newType)) {
                this.annotationMap.set(newType, {
                    type: newType,
                    display: this.annotationMap.get(type).display,
                    color: this.randomRgba(),
                    title: this.annotationMap.get(type).title+" "+a[this.annotationMap.get(type).key]
                } as RcsbAnnotationMapInterface);
            }
            return newType;
        }
        return type;
    }

    randomRgba(): string{
        var o = Math.round, r = Math.random, s = 255;
        return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
    }
}
