import {RcsbFvTrackDataElementInterface} from "../RcsbDataManager/RcsbDataManager";

interface SelectionInterface {
    rcsbFvTrackDataElement: RcsbFvTrackDataElementInterface;
    domId: string;
}

export class RcsbSelection {
    private selectedElements: Array<SelectionInterface> = new Array<SelectionInterface>();
    private hoverHighlightElements: Array<SelectionInterface> = new Array<SelectionInterface>();

    public getSelected(mode:'select'|'hover'):Array<SelectionInterface>{
        if(mode == null || mode === 'select')
            return this.selectedElements;
        else
            return this.hoverHighlightElements;
    }

    public setSelected(elements: Array<SelectionInterface> | SelectionInterface, mode:'select'|'hover'): void{
        if(mode == null || mode === 'select') {
            if (elements instanceof Array) {
                this.selectedElements = elements;
            } else {
                this.selectedElements = [elements];
            }
        }else{
            if (elements instanceof Array) {
                this.hoverHighlightElements = elements;
            } else {
                this.hoverHighlightElements = [elements];
            }
        }
    }

    public addSelected(elements: Array<SelectionInterface> | SelectionInterface, mode:'select'|'hover'): void{

        if(mode == null || mode === 'select') {
            if (elements instanceof Array) {
                this.selectedElements = this.selectedElements.concat(elements);
            } else {
                this.selectedElements.push(elements);
            }
        }else {
            if (elements instanceof Array) {
                this.hoverHighlightElements = this.selectedElements.concat(elements);
            } else {
                this.hoverHighlightElements.push(elements);
            }
        }
    }

    public clearSelection(mode:'select'|'hover'):void {
        if(mode == null || mode === 'select') {
            this.selectedElements = new Array<SelectionInterface>();
        }else{
            this.hoverHighlightElements = new Array<SelectionInterface>();
        }
    }

}