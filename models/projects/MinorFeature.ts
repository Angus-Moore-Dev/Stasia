import { v4 } from "uuid";

export class MinorFeature
{
    id: string = v4();
    majorFeatureId: string = '';
    commenceDeath: string = '';
    name: string = '';
    description: string = '';
    featureType: FeatureType[] = [];
    expectedCompletionDate: Date = new Date(Date.now());
    staffInvolved: string[] = [];
}


export enum FeatureType
{
    General = "General",
    UserInterface = "User Interface",
    UserExperience = "User Experience",
    ExpansionOfExistingLogic = "Expansion of Existing Logic",
    CreationOfNewLogic = "Creation of "
}