interface RcsbFvDefaultConfigValuesInterface  {
    readonly increasedView: number;
    readonly trackColor: string;
    readonly displayColor: string;
    readonly trackHeight: number;
    readonly trackAxisHeight: number;
    readonly trackWidth: number;
    readonly rowTitleWidth: number;
    readonly displayDomain: [number,number];
    readonly interpolationType: string;
}

export const RcsbFvDefaultConfigValues: RcsbFvDefaultConfigValuesInterface = {
    increasedView:1.5,
    trackColor: "#FFFFFF",
    displayColor: "#000000",
    trackHeight: 20,
    trackAxisHeight: 30,
    trackWidth: 920,
    rowTitleWidth: 160,
    displayDomain: [0,1],
    interpolationType: INTERPOLATION_TYPES.STEP
};

export const enum INTERPOLATION_TYPES {
    STEP = "step",
    BASIS = "basis",
    CARDINAL = "cardinal",
    LINEAR = "linear"
}

export const enum DISPLAY_TYPES {
    BLOCK = "block",
    AXIS = "axis",
    SEQUENCE = "sequence",
    PIN = "pin",
    LINE="line",
    AREA="area",
    VLINE="vline",
    VARIANT="variant",
    BOND="bond",
    COMPOSITE="composite"
}
