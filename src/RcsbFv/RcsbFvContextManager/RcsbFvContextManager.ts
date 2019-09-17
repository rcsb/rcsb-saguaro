import { Subject } from 'rxjs';
import {SelectionInterface, ScaleTransform} from "../../RcsbBoard/RcsbBoard";

const subject = new Subject();
const RcsbFvContextManager = {
    next: (obj: any) => subject.next(obj),
    asObservable: () => subject.asObservable()
};

export interface RcsbFvContextManagerInterface{
    eventType: string;
    eventData: SelectionInterface|ScaleTransform;
}

export {RcsbFvContextManager};

