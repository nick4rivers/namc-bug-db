The following documentation describes how to download and run [SchemaSpy](http://schemaspy.org/) to auto-document the bug database.

1. Make sure you have Java 8 runtime installed.
1. Visit the Schema Spy GitHub Releases page and download the single JAR file to a convenient location.
1. Download the [postgres driver jar file](https://jdbc.postgresql.org/download.html). Get the JDBC for 4.2. Place this JAR file next to the SchemaSpy JAR file.
1. Run the following command:

```bash
java -jar <schema_spy_jar_path> -t pgsql -dp <postgres_jar_path>  -db bugdb -host <postgres_host> -port <postgres_port> -u <postgres_user> -p <postgres_password> -o <output_folder> -schemas billing,entity,sample,geo,taxa,metric
```

Note the comma separated list of schemas at the end. Modify this list as needed.

The output for the bug database is large (96 mb), with the default configuration.

