![image](https://user-images.githubusercontent.com/99398403/221100014-1ef41c24-ec70-4cff-985b-1febfafd9df5.png)

A better way to organise your files, customer relationships, internal communications and project management. No need to use external services like Jira, Monday, Copper, Salesforce or some Cloud storage workaround to organise your files, this is the place to manage the business and growth side of your startup/business. Psychostasia will simply eliminate any need for you to use 8-10+ platforms and SaaS products when you can do it all here.

Currently only in use for Jensen Labs internal operations, we are planning on making it more available to the wider community at a later date.

# How do I run this?
You will need to create your own Supabase instance, it's pretty easy, just go to https://supabase.com/ to get started.
We use Doppler for our keys, however you will just need the following environment variables:

`NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]`
`NEXT_PUBLIC_SUPABASE_URL=[url]`

Once you've done that, in your instance run `npm install && npm run dev` and things should be up and running at `http://localhost:3000/`

More docs will be written about this shortly
