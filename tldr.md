# Semantic Kernel
## How to make it work

## To build the package and central repository

1. Make sure Visual Studio 2022 is installed. (You will get `/langversion:11 not supported` error otherwise.)

2. Make sure `nuget.org` is set for your nuget source.
```sh
# run this to see if nuget.org exists
dotnet nuget list source

# run this to add it if it does not exist.
dotnet nuget add source "https://api.nuget.org/v3/index.json" --name "nuget.org"
``` 

3. run `build.cmd` in the root.

## To build Copilot (`samples/apps/copilot-chat-app`)

> ### Read the [readme](samples/apps/copilot-chat-app/README.md) for more detail.

1. Go to the project folder. 
2. Install dev https certificate.
```sh
dotnet dev-certs https --trust
```

3. Set up `webapi`:
  - First go to [`appsettings.json`](samples/apps/copilot-chat-app/webapi/appsettings.json)
  and add the information about your OpenAI and Cognitive service intances.
  - Next, 
```sh
cd webapi
dotnet build
dotnet run
```
  - To test, go to https://localhost:40433/probe

4. In a separate terminal, go to `webapp`:
  - First, run `npm install --force`
  - Next update [`env.example](samples/apps/copilot-chat-app/webapp/env.example), by adding the client Id of your service principal. (Read `readme.md` for more details on how to create and setup one.)
  - Next, rename `env.example` to `.env`.
  - Run `npm start`.

5. Paste your data in [`importdoc/sample-docs`](samples/apps/copilot-chat-app/importdocument/sample-docs/) folder.

6. Make sure at the end of Step 3, the service is running.

7. You have to manually upload files in sample-docs one by one to your backend. To do that, open a terminal
```sh
cd importdocument
dotnet run -- --file "sample-docs/mydoc.pdf"
```
You can only upload `.txt` and `.pdf`.

I created a node.js wrapper to convert all `.docx` files to `.txt` and then upload all `.txt` files (including any originally `.txt` file) to the server. To use it:
```
cd importdocument/converter
npm install
cd ..
node converter
```
The server may take a long time to process the files.
