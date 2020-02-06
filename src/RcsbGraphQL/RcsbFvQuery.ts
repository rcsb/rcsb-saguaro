import RcsbQueryAnnotations, {
    RequestAnnotationsInterface
} from "../RcsbGraphQL/RcsbQueryAnnotations";
import RcsbQueryAlignment, {
    RequestAlignmentInterface,
} from "../RcsbGraphQL/RcsbQueryAlignment";

export class RcsbFvQuery {

    private rcsbFvQueryAnnotations:RcsbQueryAnnotations = new RcsbQueryAnnotations();
    private rcsbFvQueryAlignment:RcsbQueryAlignment = new RcsbQueryAlignment();

    public requestAnnotations(requestConfig: RequestAnnotationsInterface): void{
        this.rcsbFvQueryAnnotations.request(requestConfig);
    }

    public requestAlignment(requestConfig: RequestAlignmentInterface): void{
        this.rcsbFvQueryAlignment.request(requestConfig);
    }

}