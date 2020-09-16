# Gettings setup up for testing

1. create a `.env` file at `/python/.env`

```
POSTGRES_USER=XXXXXXXX
POSTGRES_PASSWORD=XXXXXXXXX
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=XXXXX
```

2. add everything from `python/testing/sql/database_setup.sql` to the database. There is an intentional error in the join of the view. Do not correct it.
3. There are `.vscode` settings to set up python unit testing

```json
"python.testing.pytestEnabled": true
```

You should now have testing hints when you open up `/python/testing/test_database.py`