Overview
--------

Clerk authenticates users, manages session tokens, and provides user management functionality that can be used in combination with the authorization logic available in Supabase through PostgreSQL Row Level Security (RLS) policies.

Documentation
-------------

This guide explains how to connect your Supabase database with [Clerk](https://clerk.com/).

Clerk is a user management platform that provides beautifully designed, drop-in UI components to quickly add authentication capabilities to your application. Clerk supports numerous sign-in strategies such as social providers, email links, and passkeys, as well as a suite of B2B SaaS tools and APIs to build your own authentication flows.

The Clerk integration uses the authorization logic available in Supabase through PostgreSQL Row Level Security (RLS) policies.

This guide assumes you have a Supabase account and database project already set up.

If you don't have a Clerk account, you can [create an account for free](https://dashboard.clerk.com/sign-up).

How the integration works
-------------------------

RLS works by validating database queries according to the restrictions defined in the RLS policies applied to the table. This guide will show you how to create RLS policies that restrict access to data based on the user's Clerk ID. This way, users can only access data that belongs to them.

To set this up, you will:

-   Create a function in Supabase to parse the Clerk user ID from the authentication token.
-   Create a `user_id` column that defaults to the Clerk user's ID when new records are created.
-   Create policies to restrict what data can be read and inserted.
-   Use the Clerk Supabase integration helper in your code to authenticate with Supabase and execute queries.

1: Create a function to check the incoming user ID
--------------------------------------------------

Create a function named `requesting_user_id()` that will parse the Clerk user ID from the authentication token. This function will be used to set the default value of `user_id` in a table and in the RLS policies to ensure the user can only access their data.

1.  In the sidebar of your [Supabase dashboard](https://supabase.com/dashboard/projects), navigate to **Database** > **Functions**.
    
2.  Select **Create a new function**.
    
3.  In the **Add a new function** sheet, make the following changes:
    
    -   Set **Name of function** to `requesting_user_id`.
    -   Set **Return type** to `text`.
    -   Toggle **Show advanced settings** on.
    -   Set **Language** to `sql`.
    -   Populate the **Definition** with the following sql:
    
    `1`
    
    `SELECT NULLIF(   `
    
    `2`
    
    `current_setting('request.jwt.claims', true)::json->>'sub',   `
    
    `3`
    
    `''   `
    
    `4`
    
    `)::text;   `
    
    -   Select **Confirm**.

2: Create a `user_id` column
----------------------------

Next, you’ll create a `user_id` column in the table you wish to secure. This column will be used in the RLS policies to only return or modify records scoped to the user's account and it will use the `requesting_user_id()` function you just created as its default value.

1.  Navigate to the sidebar on the left and select **Table Editor.**
2.  Select the table you wish to secure.
3.  In the table, select the **+** column to add a new column.
4.  Set the **Name** to **user\_id**.
5.  Set **Type** to **text**.
6.  Set **Default Value** to `requesting_user_id()`.
7.  Select **Save** to create the column.

3: Enable RLS on your table and create the policies
---------------------------------------------------

To enable RLS on your table:

1.  In the top bar above the table, select **RLS disabled** and then **Enable RLS for this table**.
2.  In the modal that appears, select **Enable RLS**.
3.  Select the **Add RLS policy** button (which has replaced **RLS disabled).**

Create two policies: one to enforce that the data returned has a `user_id` value that matches the requestor, and another to automatically insert records with the ID of the requestor.

1.  Select **Create policy** to create the `SELECT` policy:
    -   Provide a name for the policy.
        
    -   For **Policy Command**, select **SELECT**.
        
    -   For **Target roles**, select **authenticated**.
        
    -   Replace the "-- Provide a SQL expression for the using statement" with the following:
        
        `1`
        
        `requesting_user_id() = user_id   `
        
    -   Select **Save policy**.
        
2.  Select **Create policy** to create the `INSERT` policy:
    -   Provide a name for the policy.
        
    -   For **Policy Command**, select **INSERT**.
        
    -   For **Target roles**, select **authenticated**.
        
    -   Replace the "-- Provide a SQL expression for the with check statement" with the following:
        
        `1`
        
        `requesting_user_id() = user_id   `
        
    -   Select **Save policy**.
        

4: Get your Supabase JWT secret key
-----------------------------------

To give users access to your data, Supabase's API requires an authentication token. Your Clerk project can generate these authentication tokens, but it needs your Supabase project's JWT secret key first.

To find the JWT secret key:

1.  In the sidebar of your [Supabase dashboard](https://supabase.com/dashboard/projects), navigate to **Project Settings > API**.
2.  Under the **JWT Settings** section, save the value in the **JWT Secret** field somewhere secure. This value will be used in the next step.

5: Create a Supabase JWT template
---------------------------------

Clerk's JWT templates allow you to generate a new valid Supabase authentication token for each signed-in user. These tokens allow authenticated users to access your data with Supabase's API.

To create a Clerk JWT template for Supabase:

1.  Navigate to the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=jwt-templates).
2.  In the navigation sidebar, select **JWT Templates**.
3.  Select the **New template** button, then select **Supabase** from the list of options.
4.  Configure your template:
    -   The value of the **Name** field will be required when using the template in your code. For this tutorial, name it `supabase`.
    -   **Signing algorithm** will be `HS256` by default. This algorithm is required to use JWTs with Supabase. [Learn more in the Supabase docs](https://supabase.com/docs/guides/resources/glossary#jwt-signing-secret).
    -   Under **Signing key**, add the value of your Supabase **JWT secret key** from the previous step.
    -   You can leave all other fields at their default settings or customize them to your needs. See the [Clerk JWT template guide](https://clerk.com/docs/backend-requests/making/jwt-templates#creating-a-template) to learn more about these settings.
    -   Select **Save** from the notification bubble to complete setup.

6: Configure your application
-----------------------------

The next step is to configure your client. Supabase provides an official [JavaScript/TypeScript client library](https://github.com/supabase/supabase-js) and there are [libraries in other languages](https://supabase.com/docs/reference/javascript/installing) built by the community.

This guide will use a Next.js project with the JS client as an example, but the mechanism of setting the authentication token should be similar to other libraries and frameworks.

### Set up Clerk

To configure Clerk in your Next.js application, follow the [Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs) available in the [Clerk docs](https://clerk.com/docs). The linked guide will walk you through the basics of configuring Clerk by adding sign-up and sign-in functionality to your application.

### Configure the Supabase client

Next, the Supabase client used to query and modify data in your Supabase database needs to be modified to use the Clerk token as part of the request headers. This can be done by customizing the `fetch` that is used by Supabase like so:

`1`

`import { useSession, useUser } from '@clerk/nextjs'   `

`2`

`import { createClient } from '@supabase/supabase-js'   `

`3`

`4`

`export default function Home() {   `

`5`

``// The `useSession()` hook will be used to get the Clerk `session` object   ``

`6`

`const { session } = useSession()   `

`7`

`8`

`// Create a custom supabase client that injects the Clerk Supabase token into the request headers   `

`9`

`function createClerkSupabaseClient() {   `

`10`

`return createClient(   `

`11`

`process.env.NEXT_PUBLIC_SUPABASE_URL!,   `

`12`

`process.env.NEXT_PUBLIC_SUPABASE_KEY!,   `

`13`

`{   `

`14`

`global: {   `

`15`

`// Get the custom Supabase token from Clerk   `

`16`

`fetch: async (url, options = {}) => {   `

`17`

``// The Clerk `session` object has the getToken() method   ``

`18`

`const clerkToken = await session?.getToken({   `

`19`

`// Pass the name of the JWT template you created in the Clerk Dashboard   `

`20`

`// For this tutorial, you named it 'supabase'   `

`21`

`template: 'supabase',   `

`22`

`})   `

`23`

`24`

`// Insert the Clerk Supabase token into the headers   `

`25`

`const headers = new Headers(options?.headers)   `

`26`

``headers.set('Authorization', `Bearer ${clerkToken}`)   ``

`27`

`28`

`// Call the default fetch   `

`29`

`return fetch(url, {   `

`30`

`...options,   `

`31`

`headers,   `

`32`

`})   `

`33`

`},   `

`34`

`},   `

`35`

`},   `

`36`

`)   `

`37`

`}   `

`38`

`39`

`//... The rest of the code is removed for brevity   `

`40`

`}   `

Then the client can be created and used throughout the application:

`1`

`const client = createClerkSupabaseClient()   `

If you have previously followed the Supabase Next.js guide, you’d replace any use of the `createClient` function with the one above.

### Example

The following example demonstrates how this technique is used in a to-do application that queries data from and inserts data into a `tasks` table, which will be secured with the RLS policies created in previous steps:

`1`

`'use client'   `

`2`

`import { useEffect, useState } from 'react'   `

`3`

`import { useSession, useUser } from '@clerk/nextjs'   `

`4`

`import { createClient } from '@supabase/supabase-js'   `

`5`

`6`

`export default function Home() {   `

`7`

`const [tasks, setTasks] = useState<any[]>([])   `

`8`

`const [loading, setLoading] = useState(true)   `

`9`

`const [name, setName] = useState('')   `

`10`

``// The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user   ``

`11`

`const { user } = useUser()   `

`12`

``// The `useSession()` hook will be used to get the Clerk `session` object   ``

`13`

`const { session } = useSession()   `

`14`

`15`

`// Create a custom supabase client that injects the Clerk Supabase token into the request headers   `

`16`

`function createClerkSupabaseClient() {   `

`17`

`return createClient(   `

`18`

`process.env.NEXT_PUBLIC_SUPABASE_URL!,   `

`19`

`process.env.NEXT_PUBLIC_SUPABASE_KEY!,   `

`20`

`{   `

`21`

`global: {   `

`22`

`// Get the custom Supabase token from Clerk   `

`23`

`fetch: async (url, options = {}) => {   `

`24`

`const clerkToken = await session?.getToken({   `

`25`

`template: 'supabase',   `

`26`

`})   `

`27`

`28`

`// Insert the Clerk Supabase token into the headers   `

`29`

`const headers = new Headers(options?.headers)   `

`30`

``headers.set('Authorization', `Bearer ${clerkToken}`)   ``

`31`

`32`

`// Call the default fetch   `

`33`

`return fetch(url, {   `

`34`

`...options,   `

`35`

`headers,   `

`36`

`})   `

`37`

`},   `

`38`

`},   `

`39`

`},   `

`40`

`)   `

`41`

`}   `

`42`

`43`

``// Create a `client` object for accessing Supabase data using the Clerk token   ``

`44`

`const client = createClerkSupabaseClient()   `

`45`

`46`

``// This `useEffect` will wait for the `user` object to be loaded before requesting   ``

`47`

`// the tasks for the logged in user   `

`48`

`useEffect(() => {   `

`49`

`if (!user) return   `

`50`

`51`

`async function loadTasks() {   `

`52`

`setLoading(true)   `

`53`

`const { data, error } = await client.from('tasks').select()   `

`54`

`if (!error) setTasks(data)   `

`55`

`setLoading(false)   `

`56`

`}   `

`57`

`58`

`loadTasks()   `

`59`

`}, [user])   `

`60`

`61`

`async function createTask(e: React.FormEvent<HTMLFormElement>) {   `

`62`

`e.preventDefault()   `

`63`

`// Insert task into the "tasks" database   `

`64`

`await client.from('tasks').insert({   `

`65`

`name,   `

`66`

`})   `

`67`

`window.location.reload()   `

`68`

`}   `

`69`

`70`

`return (   `

`71`

`<div>   `

`72`

`<h1>Tasks</h1>   `

`73`

`74`

`{loading && <p>Loading...</p>}   `

`75`

`76`

`{!loading && tasks.length > 0 && tasks.map((task: any) => <p>{task.name}</p>)}   `

`77`

`78`

`{!loading && tasks.length === 0 && <p>No tasks found</p>}   `

`79`

`80`

`<form onSubmit={createTask}>   `

`81`

`<input   `

`82`

`autoFocus   `

`83`

`type="text"   `

`84`

`name="name"   `

`85`

`placeholder="Enter new task"   `

`86`

`onChange={(e) => setName(e.target.value)}   `

`87`

`value={name}   `

`88`

`/>   `

`89`

`<button type="submit">Add</button>   `

`90`

`</form>   `

`91`

`</div>   `

`92`

`)   `

`93`

`}   `