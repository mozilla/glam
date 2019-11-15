from django.db import migrations

from glam.api import constants


channel_partitions = []
for channel in constants.CHANNEL_CHOICES:
    channel_partitions.append(
        """
        CREATE TABLE aggregation_{name}
        PARTITION OF aggregation
        FOR VALUES IN ({value})
        PARTITION BY LIST(version);
        """.format(
            name=channel[1], value=channel[0],
        )
    )


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql=[
                """
                CREATE TABLE aggregation (
                    id bigserial,
                    -- partition columns
                    channel integer NOT NULL,
                    version varchar(100) NOT NULL,
                    -- dimensions
                    agg_type integer NOT NULL,
                    os varchar(100),
                    build_id varchar(100),
                    metric varchar(200) NOT NULL,
                    metric_key varchar(200),
                    client_agg_type varchar(100),
                    -- data
                    metric_type varchar(100) NOT NULL,
                    total_users integer,
                    data jsonb,
                    PRIMARY KEY (id, channel, version)
                ) PARTITION BY LIST(channel);
                """,
                # Create indexes.
                # HASH indexing for smaller indexes and because we will only ever
                # do `==` comparisons.
                "CREATE INDEX ON aggregation USING HASH (os);",
                "CREATE INDEX ON aggregation USING HASH (metric);",
                # `build_id` will often use range queries.
                "CREATE INDEX ON aggregation (build_id);",
                # Create all the channel partitions.
            ]
            + channel_partitions,
            reverse_sql=["DROP TABLE aggregation"],
        )
    ]
