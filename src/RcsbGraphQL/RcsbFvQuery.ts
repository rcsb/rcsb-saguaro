import RcsbQueryAnnotations, {
    AnnotationSourceInterface,
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
    SequenceReferenceInterface
} from "../RcsbGraphQL/RcsbQueryAlignment";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();

    public readonly sequenceReference:SequenceReferenceInterface = this.rcsbFvQueryAlignment.sequenceReference;
    public readonly annotationSource:AnnotationSourceInterface = this.rcsbFvQueryAnnotations.annotationSource;

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): void{
        this.rcsbFvQueryAlignment.request(requestConfig);
    }

}