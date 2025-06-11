# SecuNIK

SecuNIK is a .NET based cybersecurity analysis platform. This repository contains a Web API and supporting services.

## Building

Ensure [.NET SDK 8](https://dotnet.microsoft.com/download) is installed and run:

```bash
dotnet build
```

This builds the solution defined in `src/SecuNik.sln`.

## Running Tests

The tests require the [.NET SDK 8](https://dotnet.microsoft.com/download).
Once the SDK is installed, run:

```bash
dotnet test
```

This is the only command necessary to execute the tests. The `npm test` script merely invokes `dotnet test` and is optional.

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

## Log Normalization and Correlation

When analyzing multiple files, raw events from different parsers are first normalized using the `ILogNormalizer` service. The bundled `SimpleLogNormalizer` standardizes timestamps, source labels and common field names.

Normalized events are then passed to the `CorrelationEngine` which groups activities by attributes such as IP address and minute-level time buckets. These correlation insights are included in the analysis result and used for AI reporting.

