export class Project
{
    id: string = ''; // uuid
    name: string = '';
    created_at: string = '';
    description: string = '';
    projectType: ProjectType = ProjectType.NoSpecificType;
    commercialisationType: CommercialisationType = CommercialisationType.None;
    peopleInvolved: string[] = []; // User IDs
    contractedContactId: string = ''; // Contact ID of the user, for contractual applications only.
    industry: string = '';
    projectTier: ProjectTier = ProjectTier.Tertiary;
}

export enum ProjectType
{
    NoSpecificType = "No Specific Type",
    Marketing = "Marketing",
    Software = "Software",
    Hardware = "Hardware",
    Graphical = "Graphical", // Videos, Advertising, Media
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

export enum ProjectTier
{
    // Core project that is crucial to your startup. Example: "Startup Website" or "Startup Software Idea".
    Primary = "Primary", 
    // Secondary project. Maybe outreach or marketing attempts. For Instance, "Email Templates" or "Internal Admin Tool". Could also be a contracted codebase if you're an agency.
    Secondary = "Secondary", 
    // Background project. For instance, "Learn Supabase".
    Tertiary = "Tertiary", 
}