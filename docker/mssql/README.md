
## Create an environment

Your `.env.database` file should sit next to `docker-compose.yml` and it should look like this:

``` bash
# For MSSQL
SA_PASSWORD=somestring
ACCEPT_EULA=Y

```
## Fun things to do

***NB: Make sure the docker daemon is running and you're in the same folder as `docker-compose.yml`

### Spin the DB up:

``` bash
docker-compose up
# OR
docker-compose up postgis
# OR
docker-compose up sqlserver
```

#### Now you can connect using datagrip: 

## Get a bash console inside the docker box

``` bash
docker-compose run postgis bash 
docker-compose run sqlserver bash 
```

## Reset the docker box and recreater it next time

``` bash
docker-compose rm
docker-compose rm postgis
docker-compose rm sqlserver
```

## Where are the files?!?

```
docker volume ls

DRIVER              VOLUME NAME
local               docker_database-data-mssql
local               docker_database-data-pg
```

```
docker inspect docker_database-data-mssql
```