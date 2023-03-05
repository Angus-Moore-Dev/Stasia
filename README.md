![psychostasia graphic](https://user-images.githubusercontent.com/99398403/222959200-11668430-670f-4454-91f2-815d1161916d.png)

A better way to organise your files, customer relationships, internal communications and project management. This Cyberpunk themed tool will ensure that there is no need to use external services like Jira, Monday, Copper, Salesforce or some Cloud storage workaround to organise your files; this is the place to manage the business and growth side of your team/company. Stasia will simply eliminate any need for you to use 8-10+ platforms and SaaS products when you can do it all here, being open source so you are free to contribute new ideas and systems to the platform.

Currently only in use for Jensen Labs internal operations, we are planning on making it more available to the wider community at a later date and will be accepting contributions at that time also.

# Getting Started
You will need to create your own Supabase instance, it's pretty easy, just go to https://supabase.com/ to get started. Supabase is a fantastic service and is FOSS, which is even cooler.

To get started, you will need the following environment variables:

`NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]`
`NEXT_PUBLIC_SUPABASE_URL=[url]`

Once you've done that, in your instance run `npm install && npm run dev` and things should be up and running at `http://localhost:3000/`

# Adding New Contacts
Stasia's core logic surrounds contacts. Contacts are people that you have interacted with and want to document their existance in relation to your business.

![ezgif-1-d3849ff91d](https://user-images.githubusercontent.com/99398403/222891295-12925e83-1297-42d7-85c9-cb8f6ee3c05f.gif)

The purpose of doing this is to create a digital repository of any contact you've had with your business associates, partners or anyone that you want to keep details in a central and aesthetic place (more work is being done on this for customers, relationship types, organisations, however this will be coming soon).


