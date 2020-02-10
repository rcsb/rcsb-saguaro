export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  UNREPRESENTABLE: any,
}

export interface AlignedRegion {
   __typename?: 'AlignedRegion',
  exon_shift?: Maybe<Array<Maybe<Scalars['Int']>>>,
  query_begin?: Maybe<Scalars['Int']>,
  query_end?: Maybe<Scalars['Int']>,
  target_begin?: Maybe<Scalars['Int']>,
  target_end?: Maybe<Scalars['Int']>,
}

export interface AlignmentResponse {
   __typename?: 'AlignmentResponse',
  query_sequence?: Maybe<Scalars['String']>,
  target_alignment?: Maybe<Array<Maybe<TargetAlignment>>>,
}

export interface AnnotationFeatures {
   __typename?: 'AnnotationFeatures',
  features?: Maybe<Array<Maybe<Feature>>>,
  source?: Maybe<Source>,
  target_id?: Maybe<Scalars['String']>,
}

export interface Coverage {
   __typename?: 'Coverage',
  query_coverage?: Maybe<Scalars['Int']>,
  query_length?: Maybe<Scalars['Int']>,
  target_coverage?: Maybe<Scalars['Int']>,
  target_length?: Maybe<Scalars['Int']>,
}

export interface Feature {
   __typename?: 'Feature',
  description?: Maybe<Scalars['String']>,
  feature_id?: Maybe<Scalars['String']>,
  feature_positions?: Maybe<Array<Maybe<FeaturePosition>>>,
  name?: Maybe<Scalars['String']>,
  type?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['Float']>,
}

export interface FeaturePosition {
   __typename?: 'FeaturePosition',
  beg_seq_id?: Maybe<Scalars['Int']>,
  end_seq_id?: Maybe<Scalars['Int']>,
  gaps?: Maybe<Array<Maybe<Gap>>>,
  open_begin?: Maybe<Scalars['Boolean']>,
  open_end?: Maybe<Scalars['Boolean']>,
  value?: Maybe<Scalars['Float']>,
}

export interface Gap {
   __typename?: 'Gap',
  begin?: Maybe<Scalars['Int']>,
  end?: Maybe<Scalars['Int']>,
}

export interface Query {
   __typename?: 'Query',
  annotations?: Maybe<Array<Maybe<AnnotationFeatures>>>,
  alignment?: Maybe<AlignmentResponse>,
}


export interface QueryAnnotationsArgs {
  reference?: Maybe<SequenceReference>,
  sources?: Maybe<Array<Maybe<Source>>>,
  range?: Maybe<Scalars['String']>,
  queryId: Scalars['String']
}


export interface QueryAlignmentArgs {
  range?: Maybe<Scalars['String']>,
  from?: Maybe<SequenceReference>,
  to?: Maybe<SequenceReference>,
  queryId: Scalars['String']
}

export enum SequenceReference {
  NcbiGenome = 'NCBI_GENOME',
  NcbiProtein = 'NCBI_PROTEIN',
  PdbEntity = 'PDB_ENTITY',
  PdbInstance = 'PDB_INSTANCE',
  Uniprot = 'UNIPROT'
}

export enum Source {
  PdbEntity = 'PDB_ENTITY',
  PdbInstance = 'PDB_INSTANCE',
  Uniprot = 'UNIPROT'
}

export interface TargetAlignment {
   __typename?: 'TargetAlignment',
  aligned_regions?: Maybe<Array<Maybe<AlignedRegion>>>,
  coverage?: Maybe<Coverage>,
  orientation?: Maybe<Scalars['Int']>,
  target_id?: Maybe<Scalars['String']>,
  target_sequence?: Maybe<Scalars['String']>,
}

