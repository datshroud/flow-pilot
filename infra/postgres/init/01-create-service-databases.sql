create role workspace with login password 'workspace';

create database cognitive_guard_workspace
    with owner = workspace
        encoding = 'UTF8'
        template = template0;

revoke all on database cognitive_guard_workspace from public;
grant connect on database cognitive_guard_workspace to workspace;

create role intelligence with login password 'intelligence';

create database cognitive_guard_intelligence
    with owner = intelligence
        encoding = 'UTF8'
        template = template0;

revoke all on database cognitive_guard_intelligence from public;
grant connect on database cognitive_guard_intelligence to intelligence;
