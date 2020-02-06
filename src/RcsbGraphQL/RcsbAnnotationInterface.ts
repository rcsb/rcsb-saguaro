export interface AnnotationFeatures {
    features?:  Feature[];
    source?:    Source;
    target_id?: string;
}

/**
 * JSON schema for core NCBI collection in RCSB Data Warehouse.
 */
export interface Feature {
    /**
     * A description for the feature.
     */
    description?: string;
    /**
     * An identifier for the feature.
     */
    feature_id?:        string;
    feature_positions?: FeaturePosition[];
    /**
     * A name for the feature.
     */
    name?: string;
    /**
     * A type or category of the feature.
     */
    type?: string;
    /**
     * The value for the feature.
     */
    value?: number;
}

export interface FeaturePosition {
    /**
     * An identifier for the monomer at which this segment of the feature begins.
     */
    beg_seq_id?: number;
    /**
     * An identifier for the monomer at which this segment of the feature ends.
     */
    end_seq_id?: number;
    gaps?:       Gap[];
    open_begin?: boolean;
    open_end?:   boolean;
    /**
     * The value for the feature at this monomer.
     */
    value?: number;
}

export interface Gap {
    begin?: number;
    end?:   number;
}

export enum Source {
    PdbEntity = "PDB_ENTITY",
    PdbInstance = "PDB_INSTANCE",
    Uniprot = "UNIPROT",
}
