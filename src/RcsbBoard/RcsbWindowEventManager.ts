
export namespace RcsbWindowEventManager {

    const intersectionCallbacks: {[key:string]:(isIntersecting:boolean)=>void} = {};
    const intersectionObserver:IntersectionObserver  = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            intersectionCallbacks[entry.target.id]?.(entry.isIntersecting);
        });
    },{
        threshold: 1
    });
    export function intersectionObserve(target: Element, callback:(isIntersecting:boolean)=>void): void {
        intersectionObserver.observe(target);
        intersectionCallbacks[target.id] = callback;
    }

    export function intersectionUnobserve(target: Element): void {
        intersectionObserver.unobserve(target);
    }

}

