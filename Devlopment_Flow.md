# Steps by step notes of developmemt

npx create-next-app@canary
enable dynamic IO and authInterrupts

# DB Setup

install drizzle kit
install pg
install drizzle orm
src-> drizzle-> migration ,schema,db.ts, schema.ts, schemaHelpers

-Hook Drizzle Up
defineConfig root>drizzle.config.ts
in short tell drizzle paths of schema file where migration file will be stored and add DB Creds from ENV

-Setup Env
install @t3-oss/env-nextjs (it throes errors if any env file filed is empty by validation through zod)
install zod (validation lib)
src->data->env> client.ts,server,ts

# DB Schema Setup

...drizzle>schema> (course,product etc).ts
Define Enums
Define Tables
Define RelationShips

In drizzle for many to may relationsship a joint table is needed (ex: courseProduct.ts)

Users is not actually deleted (user specific data is removed) to keep the records of product purchase

-schema helpers for id and timestamps
...drizzle>schemaHelper.ts

export all schema in throw file ...drizzle>schema.ts

add db.ts and pass creds and schema file to setup db

# DB Migration/Docker Setup

-add db:generate, db:migrate ,db:studio in package,json
-add creds in .env file

start docker container
run db:generate

# Clerk Setup

go to clerk > create application > configure signin methods > install lib for cleark > add clerk envs from clerk doc

in data>client.ts> you will need manually define which environment variable can be accessedd in frontend for security purposes

add middleware.ts in src folder

add clerkProvider in root layout.tsx

add env for sign in/up urls from clerk doc

create app>(auth)>sign-in/[[...sign-in]]/page.tsx
and SignIn comp from clerk

create app>(auth)>sign-up/[[...sign-up]]/page.tsx
and SignUp comp from clerk

create app>admin
create app>(consumer)>layout.tsx (write layout code...)
edit global.css to modify container classname

add consumer layout
configure settings in clerk

# Webhook Setup

we need clerk webhook to sync our db data with clerk and clerk db data with ours

create fold features( it will contain all the features of application) > users > db > cache.ts,users.ts

users.ts will contain insert, update, delete function

in tsconfig.ts set unCheckedUndexAccess:true (for a array index can also be null for more -> 1:00:00)

-> to setup webhook on clerk
goto clerk > configure > side menu (click on webhooks)

Connected to wehook with forwareded port endpoint (https:forwared-port/api/webhooks)

create fold api in app>api>webhooks>clerk>route.ts

in clerk> webhook
enable events on created,createdAtEdge,updated,deleted

copy webhook secret add secret in .env

to access secret add var in dataadd switch>env > server.ts

copy paste route.ts code from webhooks page
npm i svix (used by clerk webhooks )

now in routes.ts at the end add a switch statement for doing action for differnt events

2.  3. 4. Give permisssion to add name in clerk 5. create insert update delete function in fetures folder to sync eith clerk and store in personal DB
          6., enabled user related insert update delted operations 6. created folder in api to listen to clerk webhook
