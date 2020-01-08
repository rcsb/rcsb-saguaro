import RcsbQueryAnnotations, {
    AnnotationReferenceInterface, AnnotationSourceInterface,
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
    SequenceReferenceInterface
} from "../RcsbGraphQL/RcsbQueryAlignment";
import RcsbInstanceToEntity, {RequestTranslateInterface} from "../RcsbGraphQL/RcsbInstanceToEntity";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();
    private rcsbFvInstanceToEntity:RcsbInstanceToEntity = new RcsbInstanceToEntity();

    public readonly sequenceReference:SequenceReferenceInterface = this.rcsbFvQueryAlignment.sequenceReference;
    public readonly annotationReference:AnnotationReferenceInterface = this.rcsbFvQueryAnnotations.annotationReference;
    public readonly annotationSource:AnnotationSourceInterface = this.rcsbFvQueryAnnotations.annotationSource;

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): void{
        this.rcsbFvQueryAlignment.request(requestConfig);
    }

    public translateInstanceToEntity(requestConfig: RequestTranslateInterface): void{
        this.rcsbFvInstanceToEntity.request(requestConfig);

    }
}