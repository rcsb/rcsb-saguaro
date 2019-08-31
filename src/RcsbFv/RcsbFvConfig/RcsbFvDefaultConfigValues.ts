export class RcsbFvDefaultConfigValues {
    public static INCREASED_VIEW: number = 1.5;
    public static TRACK_COLOR: string = "#FFFFFF";
    public static DISPLAY_COLOR: string = "#000000";
    public static TRACK_HEIGHT: number = 30;
    public static TRACK_WIDTH: number = 920;
    public static ROW_TITLE_WIDTH: number = 150;
    public static DISPLAY_DOMAIN: Array<number> = [0,1];
}

export const enum DISPLAY_TYPES {
    BLOCK = "block",
    AXIS = "axis",
    SEQUENCE = "sequence",
    PIN = "pin"
}
