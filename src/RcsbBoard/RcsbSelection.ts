import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";

interface SelectionInterface {
    rcsbFvTrackDataElement: RcsbFvTrackDataElementInterface;
    domId: string;
}

export class RcsbSelection {
    private selectedElements: Array<SelectionInterface> = new Array<SelectionInterface>();

    public getSelected():Array<SelectionInterface>{
        return this.selectedElements;
    }

    public setSelected(elements: Array<SelectionInterface> | SelectionInterface): void{
        if(elements instanceof Array){
            this.selectedElements = elements;
        }else {
            this.selectedElements = [elements];
        }
    }

    public addSelected(elements: Array<SelectionInterface> | SelectionInterface): void{
        if(elements instanceof Array){
            this.selectedElements = this.selectedElements.concat(elements);
        }else {
            this.selectedElements.push(elements);
        }
    }

    public clearSelection():void {
        this.selectedElements = new Array<SelectionInterface>();
    }
}