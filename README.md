# SecuNIK

SecuNIK is a .NET based cybersecurity analysis platform. This repository contains a Web API and supporting services.

## Building

Ensure [.NET SDK 8](https://dotnet.microsoft.com/download) is installed and run:

```bash
dotnet build
```

This builds the solution defined in `src/SecuNik.sln`.

## Running the API

Run the API project directly using `dotnet run`:

```bash
dotnet run --project src/SecuNik.API
```

By default the API listens on <http://localhost:5043>. Swagger UI is available at `/swagger` when running in development mode.

## Configuration

OpenAI integration is configured via `appsettings.json` or environment variables. Set your OpenAI API key using one of the following approaches:

1. Edit `src/SecuNik.API/appsettings.json` and set `OpenAI:ApiKey` to your key.
2. Or set an environment variable before running:

```bash
export OpenAI__ApiKey=your-openai-api-key
```

Other options such as model, token limits and temperature can also be configured in `appsettings.json`.

