import { Subject } from 'rxjs';

const subject = new Subject();
const RcsbFvContextManager = {
    next: (obj: any) => subject.next(obj),
    asObservable: () => subject.asObservable()
};

export interface RcsbFvContextManagerInterface{
    id: string;
    eventType: string;
    scale?: any;
    tr?: any;
    begin?: number;
    end?: number;
}

export {RcsbFvContextManager};

