backups

docker exec -it <postgresql_container> bash
apt-get update && apt-get install pgagent
Install the pgAgent extension:

pgsql -h hostname -U username -d db_name -f create_ext_pgagent.sql
create_ext_pgagent.sql:

CREATE EXTENSION pgagent IF NOT EXISTS;
CREATE LANGUAGE plpgsql IF NOT EXISTS;
Start pgagent:

pgagent hostaddr=localhost dbname=postgres user=<user_name> -s pgagent_log.log
Confirm that pgagent is connected to the database:

SELECT * FROM pgagent.pga_jobagent;


https://www.digitalocean.com/community/tutorials/how-to-schedule-automatic-backups-for-postgresql-with-pgagent-in-pgadmin