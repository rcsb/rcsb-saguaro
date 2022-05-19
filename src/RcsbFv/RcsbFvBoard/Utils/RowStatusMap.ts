export class RowStatusMap {

    private readonly rowReadyMap: Map<string,boolean> = new Map<string, boolean>();

    constructor() {
    }

    public set(key: string, value: boolean): void {
        this.rowReadyMap.set(key, value);
    }

    public size(): number {
        return this.rowReadyMap.size;
    }

    public clear(): void {
        this.rowReadyMap.clear();
    }

    public complete(): boolean{
        return Array.from(this.rowReadyMap.values()).filter(a=>a).length ==  this.rowReadyMap.size;
    }

    public ready(): number{
        return Array.from(this.rowReadyMap.values()).filter(a=>a).length;
    }

}