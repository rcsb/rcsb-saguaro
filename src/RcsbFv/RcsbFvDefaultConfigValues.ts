export class RcsbFvDefaultConfigValues {
    public static INCREASED_VIEW: number = 1.5;
    public static TRACK_COLOR: string = "#FFFFFF";
    public static DISPLAY_COLOR: string = "#000000";
    public static HEIGHT: number = 30;
    public static DISPLAY_DOMAIN: Array<number> = [0,1];
}

export const enum TRACK_TYPES {
    BLOCK = "block",
    AXIS = "axis",
    SEQUENCE = "sequence",
    PIN = "pin"
}
