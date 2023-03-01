export class Lead
{
    id: string;
    name: string;
    description: string;
    associations: string[];
    previewImageURL: string;
    created_at: string;
    stage: LeadStage;

    constructor(id: string, name: string, description: string, associations: string[], previewImageURL: string, created_at: string, leadStage: LeadStage)
    {
        this.id = id;
        this.name = name;
        this.stage = leadStage;
        this.created_at = created_at;
        this.description = description;
        this.associations = associations;
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