from django.db import migrations

from glam.api import constants


channel_partitions = []
for channel in constants.CHANNEL_CHOICES:
    channel_partitions.append(
        """
        CREATE TABLE glam_aggregation_{name}
        PARTITION OF glam_aggregation
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
                CREATE TABLE glam_aggregation (
                    id bigserial,
                    -- partition columns
                    channel integer NOT NULL,
                    version varchar(100) NOT NULL,
                    -- dimensions
                    agg_type integer NOT NULL,
                    os varchar(100) NOT NULL,
                    build_id varchar(100) NOT NULL,
                    metric varchar(200) NOT NULL,
                    metric_key varchar(200) NOT NULL,
                    client_agg_type varchar(100) NOT NULL,
                    -- data
                    metric_type varchar(100) NOT NULL,
                    total_users integer,
                    data jsonb,
                    PRIMARY KEY (id, channel, version)
                ) PARTITION BY LIST(channel);
                """,
                # Create unique index.
                """
                ALTER TABLE ONLY glam_aggregation
                ADD CONSTRAINT glam_aggregation_dimensions_idx UNIQUE (
                    channel, version, agg_type, os, build_id, metric,
                    metric_key, client_agg_type);
                """
                # Create indexes.
                # HASH indexing for smaller indexes and because we will only ever
                # do `==` comparisons.
                "CREATE INDEX ON glam_aggregation USING HASH (os);",
                "CREATE INDEX ON glam_aggregation USING HASH (metric);",
                # `build_id` will often use range queries.
                "CREATE INDEX ON glam_aggregation (build_id);",
                # Create all the channel partitions.
            ]
            + channel_partitions,
            reverse_sql=["DROP TABLE glam_aggregation"],
        )
    ]
