## readAccessGroup

Allows to read an access group

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.accessGroups.readAccessGroup({
    idOrName: "ag_1a2b3c4d5e6f7g8h9i0j",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## updateAccessGroup

Allows to update an access group metadata

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.accessGroups.updateAccessGroup({
    idOrName: "<value>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      name: "My access group",
      projects: [
        {
          projectId: "prj_ndlgr43fadlPyCtREAqxxdyFK",
          role: "ADMIN",
        },
      ],
      membersToAdd: [
        "usr_1a2b3c4d5e6f7g8h9i0j",
        "usr_2b3c4d5e6f7g8h9i0j1k",
      ],
      membersToRemove: [
        "usr_1a2b3c4d5e6f7g8h9i0j",
        "usr_2b3c4d5e6f7g8h9i0j1k",
      ],
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## listDeploymentAliases

Retrieves all Aliases for the Deployment with the given ID. The authenticated user or team must own the deployment.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.aliases.listDeploymentAliases({
    id: "dpl_FjvFJncQHQcZMznrUm9EoB8sFuPa",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## assignAlias

Creates a new alias for the deployment with the given deployment ID. The authenticated user or team must own this deployment. If the desired alias is already assigned to another deployment, then it will be removed from the old deployment and assigned to the new one.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.aliases.assignAlias({
    id: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      alias: "my-alias.vercel.app",
      redirect: null,
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## getV1ExperimentationItems

Query experimentation items

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.apiExperimentation.getV1ExperimentationItems({});

  // Handle the result
  console.log(result);
}

run();

```

## recordEvents

Records an artifacts cache usage event. The body of this request is an array of cache usage events. The supported event types are `HIT` and `MISS`. The source is either `LOCAL` the cache event was on the users filesystem cache or `REMOTE` if the cache event is for a remote cache. When the event is a `HIT` the request also accepts a number `duration` which is the time taken to generate the artifact in the cache.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await vercel.artifacts.recordEvents({
    xArtifactClientCi: "VERCEL",
    xArtifactClientInteractive: 0,
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: [
      {
        sessionId: "<id>",
        source: "LOCAL",
        event: "HIT",
        hash: "12HKQaOmR5t5Uy6vdcQsNIiZgHGB",
        duration: 400,
      },
    ],
  });


}

run();

```

## status

Check the status of Remote Caching for this principal. Returns a JSON-encoded status indicating if Remote Caching is enabled, disabled, or disabled due to usage limits.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.artifacts.status({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## exchangeSsoToken

During the autorization process, Vercel sends the user to the provider [redirectLoginUrl](https://vercel.com/docs/integrations/create-integration/submit-integration#redirect-login-url), that includes the OAuth authorization `code` parameter. The provider then calls the SSO Token Exchange endpoint with the sent code and receives the OIDC token. They log the user in based on this token and redirects the user back to the Vercel account using deep-link parameters included the redirectLoginUrl. This is used to verify the identity of the user during the [**Open in Provider** flow](https://vercel.com/docs/integrations/marketplace-flows#open-in-provider-button-flow). Providers should not persist the returned `id_token` in a database since the token will expire.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel();

async function run() {
  const result = await vercel.authentication.exchangeSsoToken({
    code: "<value>",
    clientId: "<id>",
    clientSecret: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();

```

## listAuthTokens

Retrieve a list of the current User's authentication tokens.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.authentication.listAuthTokens();

  // Handle the result
  console.log(result);
}

run();

```

## createAuthToken

Creates and returns a new authentication token for the currently authenticated User. The `bearerToken` property is only provided once, in the response body, so be sure to save it on the client for use with API requests.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.authentication.createAuthToken({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      name: "<value>",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## getCertById

Get cert by id

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.certs.getCertById({
    id: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## removeCert

Remove cert

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.certs.removeCert({
    id: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## issueCert

Issue a new cert

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.certs.issueCert({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {},
  });

  // Handle the result
  console.log(result);
}

run();

```

## createCheck

Creates a new check. This endpoint must be called with an OAuth2 or it will produce a 400 error.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.checks.createCheck({
    deploymentId: "dpl_2qn7PZrx89yxY34vEZPD31Y9XVj6",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      name: "Performance Check",
      path: "/",
      blocking: true,
      detailsUrl: "http://example.com",
      externalId: "1234abc",
      rerequestable: true,
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## getAllChecks

List all of the checks created for a deployment.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.checks.getAllChecks({
    deploymentId: "dpl_2qn7PZrx89yxY34vEZPD31Y9XVj6",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getCheck

Return a detailed response for a single check.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const ver
=== deployments/README.md ===
# Deployments
(*deployments*)

## Overview

### Available Operations

* [getDeploymentEvents](#getdeploymentevents) - Get deployment events
* [updateIntegrationDeploymentAction](#updateintegrationdeploymentaction) - Update deployment integration action
* [getDeployment](#getdeployment) - Get a deployment by ID or URL
* [createDeployment](#createdeployment) - Create a new deployment
* [cancelDeployment](#canceldeployment) - Cancel a deployment
* [uploadFile](#uploadfile) - Upload Deployment Files
* [listDeploymentFiles](#listdeploymentfiles) - List Deployment Files
* [getDeploymentFileContents](#getdeploymentfilecontents) - Get Deployment File Contents
* [getDeployments](#getdeployments) - List deployments
* [deleteDeployment](#deletedeployment) - Delete a Deployment

## getDeploymentEvents

Get the build logs of a deployment by deployment ID and build ID. It can work as an infinite stream of logs or as a JSON endpoint depending on the input parameters.

### Example Usage


```

## updateIntegrationDeploymentAction

Updates the deployment integration action for the specified integration installation

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await vercel.deployments.updateIntegrationDeploymentAction({
    deploymentId: "<id>",
    integrationConfigurationId: "<id>",
    resourceId: "<id>",
    action: "<value>",
  });


}

run();

```

## getRecords

Retrieves a list of DNS records created for a domain name. By default it returns 20 records if no limit is provided. The rest can be retrieved using the pagination options.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.dns.getRecords({
    domain: "example.com",
    limit: "20",
    since: "1609499532000",
    until: "1612264332000",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## createRecord

Creates a DNS record for a domain.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.dns.createRecord({
    domain: "example.com",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      type: "CNAME",
      ttl: 60,
      https: {
        priority: 10,
        target: "host.example.com",
        params: "alpn=h2,h3",
      },
      comment: "used to verify ownership of domain",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## buyDomain

Allows to purchase the specified domain.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.domains.buyDomain({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      name: "example.com",
      expectedPrice: 10,
      renew: true,
      country: "US",
      orgName: "Acme Inc.",
      firstName: "Jane",
      lastName: "Doe",
      address1: "340 S Lemon Ave Suite 4133",
      city: "San Francisco",
      state: "CA",
      postalCode: "91789",
      phone: "+1.4158551452",
      email: "jane.doe@someplace.com",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## checkDomainPrice

Check the price to purchase a domain and how long a single purchase period is.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.domains.checkDomainPrice({
    name: "example.com",
    type: "new",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getEdgeConfigs

Returns all Edge Configs.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.edgeConfig.getEdgeConfigs({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## createEdgeConfig

Creates an Edge Config.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.edgeConfig.createEdgeConfig({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      slug: "<value>",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## createCustomEnvironment

Creates a custom environment for the current project. Cannot be named 'Production' or 'Preview'.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.environment.createCustomEnvironment({
    idOrName: "<value>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getV9ProjectsIdOrNameCustomEnvironments

Retrieve custom environments for the project. Must not be named 'Production' or 'Preview'.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.environment.getV9ProjectsIdOrNameCustomEnvironments({
    idOrName: "<value>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getCustomEnvironment

Retrieve a custom environment for the project. Must not be named 'Production' or 'Preview'.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",

=== integrations/README.md ===
# Integrations
(*integrations*)

## Overview

### Available Operations

* [updateIntegrationDeploymentAction](#updateintegrationdeploymentaction) - Update deployment integration action
* [getConfigurations](#getconfigurations) - Get configurations for the authenticated user or team
* [getConfiguration](#getconfiguration) - Retrieve an integration configuration
* [deleteConfiguration](#deleteconfiguration) - Delete an integration configuration
* [gitNamespaces](#gitnamespaces) - List git namespaces by provider
* [searchRepo](#searchrepo) - List git repositories linked to namespace by provider

## updateIntegrationDeploymentAction

Updates the deployment integration action for the specified integration installation

### Example Usage


```

## getConfigurations

Allows to retrieve all configurations for an authenticated integration. When the `project` view is used, configurations generated for the authorization flow will be filtered out of the results.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.integrations.getConfigurations({
    view: "account",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getConfiguration

Allows to retrieve a the configuration with the provided id in case it exists. The authenticated user or team must be the owner of the config in order to access it.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.i
=== logdrains/README.md ===
# LogDrains
(*logDrains*)

## Overview

### Available Operations

* [getConfigurableLogDrain](#getconfigurablelogdrain) - Retrieves a Configurable Log Drain
* [deleteConfigurableLogDrain](#deleteconfigurablelogdrain) - Deletes a Configurable Log Drain
* [getAllLogDrains](#getalllogdrains) - Retrieves a list of all the Log Drains
* [createConfigurableLogDrain](#createconfigurablelogdrain) - Creates a Configurable Log Drain
* [getIntegrationLogDrains](#getintegrationlogdrains) - Retrieves a list of Integration log drains
* [createLogDrain](#createlogdrain) - Creates a new Integration Log Drain
* [deleteIntegrationLogDrain](#deleteintegrationlogdrain) - Deletes the Integration log drain with the provided `id`

## getConfigurableLogDrain

Retrieves a Configurable Log Drain. This endpoint must be called with a team AccessToken (integration OAuth2 clients are not allowed). Only log drains owned by the authenticated team can be accessed.

### Example Usage


```

## deleteConfigurableLogDrain

Deletes a Configurable Log Drain. This endpoint must be called with a team AccessToken (integration OAuth2 clients are not allowed). Only log drains owned by the authenticated team can be deleted.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  await vercel.logDrains.deleteConfigurableLogDrain({
    id: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });


}

run();

```

## getProjectMembers

Lists all members of a project.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.projectMembers.getProjectMembers({
    idOrName: "prj_pavWOn1iLObbXLRiwVvzmPrTWyTf",
    limit: 20,
    since: 1540095775951,
    until: 1540095775951,
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## addProjectMember

Adds a new member to the project.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.projectMembers.addProjectMember({
    idOrName: "prj_pavWOn1iLObbXLRiwVvzmPrTWyTf",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      uid: "ndlgr43fadlPyCtREAqxxdyFK",
      username: "example",
      email: "entity@example.com",
      role: "ADMIN",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## removeProjectMember

Remove a member from a specific project

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.projectMembers.remove
=== projects/README.md ===
# Projects
(*projects*)

## Overview

### Available Operations

* [updateProjectDataCache](#updateprojectdatacache) - Update the data cache feature
* [getProjects](#getprojects) - Retrieve a list of projects
* [createProject](#createproject) - Create a new project
* [updateProject](#updateproject) - Update an existing project
* [deleteProject](#deleteproject) - Delete a Project
* [getProjectDomains](#getprojectdomains) - Retrieve project domains by project by id or name
* [getProjectDomain](#getprojectdomain) - Get a project domain
* [updateProjectDomain](#updateprojectdomain) - Update a project domain
* [removeProjectDomain](#removeprojectdomain) - Remove a domain from a project
* [addProjectDomain](#addprojectdomain) - Add a domain to a project
* [verifyProjectDomain](#verifyprojectdomain) - Verify project domain
* [filterProjectEnvs](#filterprojectenvs) - Retrieve the environment variables of a project by id or name
* [createProjectEnv](#createprojectenv) - Create one or more environment variables
* [getProjectEnv](#getprojectenv) - Retrieve the decrypted value of an environment variable of a project by id
* [removeProjectEnv](#removeprojectenv) - Remove an environment variable
* [editProjectEnv](#editprojectenv) - Edit an environment variable
* [createProjectTransferRequest](#createprojecttransferrequest) - Create project transfer request
* [acceptProjectTransferRequest](#acceptprojecttransferrequest) - Accept project transfer request
* [updateProjectProtectionBypass](#updateprojectprotectionbypass) - Update Protection Bypass for Automation
* [requestPromote](#requestpromote) - Points all production domains for a project to the given deploy
* [listPromoteAliases](#listpromotealiases) - Gets a list of aliases with status for the current promote

## updateProjectDataCache

Update the data cache feature on a project.

### Example Usage


```

## getProjects

Allows to retrieve the list of projects of the authenticated user or team. The list will be paginated and the provided query parameters allow filtering the returned projects.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.projects.getProjects({
    gitForkProtection: "1",
    repoUrl: "https://github.com/vercel/next.js",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## updateAttackChallengeMode

Update the setting for determining if the project has Attack Challenge mode enabled.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.security.updateAttackChallengeMode({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      projectId: "<id>",
      attackModeEnabled: true,
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## updateFirewallConfig

Process updates to modify the existing firewall config for a project

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.security.updateFirewallConfig({
    projectId: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      action: "ip.remove",
      id: "<id>",
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## getTeamMembers

Get a paginated list of team members for the provided team.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.teams.getTeamMembers({
    limit: 20,
    since: 1540095775951,
    until: 1540095775951,
    role: "OWNER",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
  });

  // Handle the result
  console.log(result);
}

run();

```

## inviteUserToTeam

Invite a user to join the team specified in the URL. The authenticated user needs to be an `OWNER` in order to successfully invoke this endpoint. The user can be specified with an email or an ID. If both email and ID are provided, ID will take priority.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.teams.inviteUserToTeam({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    requestBody: {
      uid: "kr1PsOIzqEL5Xg6M4VZcZosf",
      email: "john@example.com",
      projects: [
        {
          projectId: "prj_ndlgr43fadlPyCtREAqxxdyFK",
          role: "ADMIN",
        },
        {
          projectId: "prj_ndlgr43fadlPyCtREAqxxdyFK",
          role: "ADMIN",
        },
      ],
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## listUserEvents

Retrieves a list of "events" generated by the User on Vercel. Events are generated when the User performs a particular action, such as logging in, creating a deployment, and joining a Team (just to name a few). When the `teamId` parameter is supplied, then the events that are returned will be in relation to the Team that was specified.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.user.listUserEvents({
    limit: 20,
    since: "2019-12-08T10:00:38.976Z",
    until: "2019-12-09T23:00:38.976Z",
    types: "login,team-member-join,domain-buy",
    userId: "aeIInYVk59zbFF2SxfyxxmuO",
    withPayload: "true",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getAuthUser

Retrieves information related to the currently authenticated User.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.user.getAuthUser();

  // Handle the result
  console.log(result);
}

run();

```

## requestDelete

Initiates the deletion process for the currently authenticated User, by sending a deletion confirmation email. The email contains a link that the user needs to visit in order to proceed with the deletion process.

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.user.requestDelete({});

  // Handle the result
  console.log(result);
}

run();

```

## createWebhook

Creates a webhook

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.webhooks.createWebhook({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
    requestBody: {
      url: "https://woeful-yin.biz",
      events: [

      ],
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

## getWebhooks

Get a list of webhooks

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.webhooks.getWebhooks({
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

## getWebhook

Get a webhook

### Example Usage

```typescript
import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: "<YOUR_BEARER_TOKEN_HERE>",
});

async function run() {
  const result = await vercel.webhooks.getWebhook({
    id: "<id>",
    teamId: "team_1a2b3c4d5e6f7g8h9i0j1k2l",
    slug: "my-team-url-slug",
  });

  // Handle the result
  console.log(result);
}

run();

```

