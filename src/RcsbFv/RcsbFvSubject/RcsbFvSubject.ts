import { Subject } from 'rxjs';
import {RcsbFvConstants} from "../RcsbFvConstants/RcsbFvConstants";

const subjectReact = new Subject();
const subjectTrigger = new Subject();

const RcsbFvSubject = {
    react:{
        set: (obj: any) => subjectReact.next(obj),
        getSubject: () => subjectReact.asObservable()
    },
    trigger:{
        set: (obj: any) => subjectTrigger.next(obj),
        getSubject: () => subjectTrigger.asObservable()
    }
};

RcsbFvSubject.trigger.getSubject().subscribe((obj:any)=>{
    RcsbFvSubject.react.set(obj);
});

export {RcsbFvSubject};

