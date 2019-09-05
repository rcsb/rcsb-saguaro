interface RcsbFvDefaultConfigValuesInterface  {
    readonly increasedView: number;
    readonly trackColor: string;
    readonly displayColor: string;
    readonly trackHeight: number;
    readonly trackWidth: number;
    readonly rowTitleWidth: number;
    readonly displayDomain: Array<number>;
}

export const RcsbFvDefaultConfigValues: RcsbFvDefaultConfigValuesInterface = {
    increasedView:1.5,
    trackColor: "#FFFFFF",
    displayColor: "#000000",
    trackHeight: 30,
    trackWidth: 920,
    rowTitleWidth: 150,
    displayDomain: [0,1]
};

export const enum DISPLAY_TYPES {
    BLOCK = "block",
    AXIS = "axis",
    SEQUENCE = "sequence",
    PIN = "pin",
    LINE="line",
    AREA="area",
    VLINE="vline"
}
