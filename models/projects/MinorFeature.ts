import { v4 } from "uuid";

export class MinorFeature
{
    id: string = v4();
    majorFeatureId: string = '';
    commenceDate: string = new Date(Date.now()).toISOString();
    name: string = '';
    description: string = '';
    objective: string = '';
    featureType: FeatureType = FeatureType.General;
    expectedCompletionDate: string = '';
    staffInvolved: string[] = [];
}


export enum FeatureType
{
    General = "General",
    UserInterface = "User Interface",
    UserExperience = "User Experience",
    Iteration = "Iteration",
    ExpansionOfExistingLogic = "Expansion of Existing Logic",
    CreationOfNewLogic = "Creation of New Logic",
    ReworkOfExistingLogic = "Rework of Existing Logic",
}