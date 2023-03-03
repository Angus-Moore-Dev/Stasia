import { Contact } from "./Contact";

export class Lead extends Contact
{
    id: string;
    initialContact: string = '';
    primaryElevationApproach: string = '';
    secondaryElevationApproach: string = '';
    otherComments: string = '';
    stage: LeadStage;

    constructor(id: string, name: string, previewImageURL: string, created_at: string, leadStage: LeadStage)
    {
        super();
        this.id = id;
        this.name = name;
        this.stage = leadStage;
        this.created_at = created_at;
        this.previewImageURL = previewImageURL;
    }
}


export enum LeadStage
{
    UNKNOWN = 'UNKNOWN',
    PreparingForContact = 'PREPARING_FOR_CONTACT',
    PossibleLead = 'POSSIBLE_LEAD',
    ProbableLead = 'PROBABLE_LEAD',
    ContractSigned = 'CONTRACT_SIGNED',
}