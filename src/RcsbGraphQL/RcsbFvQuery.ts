import RcsbQueryAnnotations, {
    AnnotationSourceInterface,
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
} from "../RcsbGraphQL/RcsbQueryAlignment";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();

    public readonly annotationSource:AnnotationSourceInterface = this.rcsbFvQueryAnnotations.annotationSource;

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): void{
        this.rcsbFvQueryAlignment.request(requestConfig);
    }

}