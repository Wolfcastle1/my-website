# My Website


## How to run locally

### Initializing the Postgres DB 
This will create a new containerized postgres db with a username and password

```
docker run -d \
  --name postgres \
  -e POSTGRES_USER=Sam \
  -e POSTGRES_PASSWORD=123 \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  postgres:latest
```

Optionally you can use the below flag in addition to the above to initialize a volume for if the container is deleted. 

`  -v pgdata:/path \ `

--- 

### Actions

To Connect from Terminal

`docker exec -it postgres psql -U Sam -d mydb`
- no password is needed when connecting locally


on DB Container:
```
docker stop postgres       # stop the container (data is preserved)
docker start postgres      # start it again
docker restart postgres    # restart it
```

On Volumes: 
```
docker volume ls              # list all volumes
docker volume inspect pgdata  # see details about a volume
docker volume rm pgdata       # delete it (container must not be using it)
```
---
