import * as annotationMap from "./RcsbAnnotationMap.json";

export interface RcsbAnnotationMapInterface {
    type: string;
    display: string;
    color: string;
    title: string;
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
}
