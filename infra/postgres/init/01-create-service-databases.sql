create role identity with login password 'identity';

create database flowpilot_identity
    with owner = identity
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_identity from public;
grant connect on database flowpilot_identity to identity;

create role platform with login password 'platform';

create database flowpilot_platform
    with owner = platform
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_platform from public;
grant connect on database flowpilot_platform to platform;

create role workflow with login password 'workflow';

create database flowpilot_workflow
    with owner = workflow
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_workflow from public;
grant connect on database flowpilot_workflow to workflow;

create role ai with login password 'ai';

create database flowpilot_ai
    with owner = ai
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_ai from public;
grant connect on database flowpilot_ai to ai;

create role integration with login password 'integration';

create database flowpilot_integration
    with owner = integration
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_integration from public;
grant connect on database flowpilot_integration to integration;
