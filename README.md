![psychostasia graphic](https://user-images.githubusercontent.com/99398403/222959200-11668430-670f-4454-91f2-815d1161916d.png)


A better way to organise your files, customer relationships, internal communications and project management. This Cyberpunk themed tool will ensure that there is no need to use external services like Jira, Monday, Copper, Salesforce or some Cloud storage workaround to organise your files; this is the place to manage the business and growth side of your team/company. Stasia will simply eliminate any need for you to use 8-10+ platforms and SaaS products when you can do it all here, being open source so you are free to contribute new ideas and systems to the platform. Kind of like Notion, except with a cool Cyberpunk aesthetic and focuses on the really critical things, zero bloat or extras.

This is currently being used for my own internal management and for my friends, but if this ends up becoming popular then I will make it easier for you to run your own instance (since there are a ton of row level policies for Supabase).

This is designed so that you can have fun creating your startup and managing the other side of product development. I just want people to have fun.

# Table of Contents
* [Getting Started](#getting-started)
* [Creating a New Contact](#creating-a-new-contact)
* [Creating a New Lead](#creating-a-new-lead)
* [Creating a New Customer](#creating-a-new-customer)
* [Internal Communications](#internal-communications)
* [Managing Your Files](#managing-your-files)
* [Projects](#projects)
* [Calendar / Events](#calendar--events)
* [Staff](#staff)


## Getting Started
You will need to create your own Supabase instance, it's pretty easy, just go to [Supabase](https://supabase.com/) to get started. Supabase is a fantastic service and is FOSS, which is even cooler. Note that you will need to configure a lot of RLS policies, which will be listed here at a later date.

To get started, you will need the following environment variables:

`NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]`
`NEXT_PUBLIC_SUPABASE_URL=[url]`

Once you've done that, in your instance run `npm install && npm run dev` and things should be up and running at `http://localhost:3000/`

## Creating A New Contact
Stasia's core logic surrounds contacts. Contacts are people that you have interacted with and want to document their existance in relation to your business.


## Creating A New Lead


## Creating A New Customer


## Internal Communications


## Managing Your Files


## Projects


## Calendar / Events


## Staff


