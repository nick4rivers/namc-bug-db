# Gettings setup up for testing

An explanation of the files:
* `conftest.py` is a magic file that `pytest` uses. fixtures in this file will be loaded in order to run the tests.
* `test_database.py` any file with the prefix `test_` is pytest's hint the it contains tests.
* `sql` this folder contains:
    * `database_setup.sql` which you should run before the tests. This file contains bugs that will cause several of your tests to fail
    * `database_fixes.sql` will fix the bugs so that all your tests will pass.

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

You should now have testing hints when you open up `/python/testing/test_database.py` allowing you to run tests individually.

To run all the tests just type `pytest -v` on the console (make sure you're in your virtualenv)