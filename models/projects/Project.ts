export class Project
{
    name: string = '';
    created_at: string = '';
    description: string = '';
    projectType: ProjectType = ProjectType.NoSpecificType;
    commercialisationType: CommercialisationType = CommercialisationType.None;
    peopleInvolved: string[] = []; // User IDs
    contractedContact: string = ''; // Contact ID of the user, for contractual applications only.
    industry: string = '';
}

export enum ProjectType
{
    NoSpecificType = "No Specific Type",
    Design = "Design",
    Marketing = "Marketing",
    UserResearch = "User Research",
    Software = "Software",
    Hardware = "Hardware",
    Business = "Business", // This is for things like new ventures
    Graphical = "Graphical", // Videos, Advertising, Media
    Financial = "Financial",
    Other = "Other",
}

export enum CommercialisationType
{
    Internal = "Internal",
    None = "Fully Free",
    PayPerProduct = "Pay Per Product",
    Subscription = "Subscription with No Free Tier",
    FreemiumSubscription = "Subscription with Free Tier",
    Contractual = "Contractual",
    Other = "Other",
}