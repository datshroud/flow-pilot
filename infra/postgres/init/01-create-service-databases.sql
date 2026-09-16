-- One database per domain service (ADR-005). The catalog is ADR-015:
-- identity and tickets each own a database; the gateway owns none, and the
-- ml service owns model artifacts on disk rather than a business database
-- (ADR-014). The worker deliberately shares the tickets database because it
-- is the same domain in a second process, not a second service.

create role identity with login password 'identity';
alter role identity createdb;

create database flowpilot_identity
    with owner = identity
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_identity from public;
grant connect on database flowpilot_identity to identity;

create role tickets with login password 'tickets';
alter role tickets createdb;

create database flowpilot_tickets
    with owner = tickets
        encoding = 'UTF8'
        template = template0;

revoke all on database flowpilot_tickets from public;
grant connect on database flowpilot_tickets to tickets;
