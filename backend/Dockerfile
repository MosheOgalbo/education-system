FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["EducationSystem.sln", "./"]
COPY ["src/EducationSystem.API/EducationSystem.API.csproj", "src/EducationSystem.API/"]
COPY ["src/EducationSystem.Application/EducationSystem.Application.csproj", "src/EducationSystem.Application/"]
COPY ["src/EducationSystem.Domain/EducationSystem.Domain.csproj", "src/EducationSystem.Domain/"]
COPY ["src/EducationSystem.Infrastructure/EducationSystem.Infrastructure.csproj", "src/EducationSystem.Infrastructure/"]
RUN dotnet restore "EducationSystem.sln"

COPY . .
RUN dotnet publish "src/EducationSystem.API/EducationSystem.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EducationSystem.API.dll"]
