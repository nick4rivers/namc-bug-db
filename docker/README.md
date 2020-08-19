
## Create an environment

Your `.env.database` file should sit next to `docker-compose.yml` and it should look like this:

``` bash
# For PG
POSTGRES_USER=somestring
POSTGRES_PASSWORD=somestring
POSTGRES_DB=somestring

# For MSSQL
SA_PASSWORD=somestring
ACCEPT_EULA=Y

```
## Fun things to do

Spin the DB up:

``` bash
docker-compose up
```

Now you can connect using datagrip: 

## Get a bash console inside the docker box

``` bash
docker-compose run postgis bash 
```

## Reset the docker box and recreater it next time

``` bash
docker-compose rm postgis
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