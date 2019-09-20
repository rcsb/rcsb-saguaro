import { Subject } from 'rxjs';
import {SelectionInterface, ScaleTransform} from "../../RcsbBoard/RcsbBoard";

const subject = new Subject();
const RcsbFvContextManager = {
    next: (obj: RcsbFvContextManagerInterface) => subject.next(obj),
    asObservable: () => subject.asObservable()
};

export enum EVENT_TYPE {
    SELECTION = "eventTypeSelection",
    SCALE = "eventTypeScale"
}
export interface RcsbFvContextManagerInterface{
    eventType: string;
    eventData: SelectionInterface|ScaleTransform;
}

export {RcsbFvContextManager};

