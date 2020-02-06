export interface RcsbAlignmentInterface {
    query_sequence?:   string;
    target_alignment?: TargetAlignment[];
}

/**
 * JSON schema for core NCBI collection in RCSB Data Warehouse.
 */
export interface TargetAlignment {
    /**
     * Aligned sequence regions
     */
    aligned_regions?: AlignedRegion[];
    /**
     * Alignment scores
     */
    coverage?:    Coverage;
    orientation?: number;
    target_id?:   string;
    /**
     * Target sequence region
     */
    target_sequence?: string;
}

/**
 * Aligned region
 */
export interface AlignedRegion {
    exon_shift?: number[];
    /**
     * Query sequence start position
     */
    query_begin: number;
    /**
     * Query sequence end position
     */
    query_end: number;
    /**
     * Target sequence start position
     */
    target_begin: number;
    /**
     * Target sequence start position
     */
    target_end: number;
}

/**
 * Alignment scores
 */
export interface Coverage {
    query_coverage:  number;
    query_length:    number;
    target_coverage: number;
    target_length:   number;
}
