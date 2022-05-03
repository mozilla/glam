from django.db import migrations

from glam.api import constants


partitions = []
for channel in constants.CHANNEL_CHOICES:
    partitions.extend(
        [
            f"""
        CREATE TABLE glam_aggregation_{channel[1]}
        PARTITION OF glam_aggregation
        FOR VALUES IN ({channel[0]});
        """,
            f"""
        CREATE MATERIALIZED VIEW view_glam_aggregation_{channel[1]}
        AS SELECT * FROM glam_aggregation_{channel[1]};
        """,
            f"""
        CREATE UNIQUE INDEX ON view_glam_aggregation_{channel[1]} (id);
        """,
            f"""
        CREATE INDEX ON view_glam_aggregation_{channel[1]} USING HASH (metric);
        """,
            f"""
        CREATE INDEX ON view_glam_aggregation_{channel[1]} (version);
        """,
            f"""
        CREATE INDEX ON view_glam_aggregation_{channel[1]} USING HASH (os);
        """,
        ]
    )


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql=[
                """
                CREATE TABLE glam_aggregation (
                    id bigserial,
                    channel integer NOT NULL,
                    version varchar(100) NOT NULL,
                    agg_type integer NOT NULL,
                    os varchar(100) NOT NULL,
                    build_id varchar(100) NOT NULL,
                    process integer NOT NULL,
                    metric varchar(200) NOT NULL,
                    metric_key varchar(200) NOT NULL,
                    client_agg_type varchar(100) NOT NULL,
                    metric_type varchar(100) NOT NULL,
                    total_users integer,
                    data jsonb,
                    PRIMARY KEY (id, channel)
                ) PARTITION BY LIST(channel);
                """,
                # Create unique index.
                """
                ALTER TABLE ONLY glam_aggregation
                ADD CONSTRAINT glam_aggregation_dimensions_idx UNIQUE (
                    channel, version, agg_type, os, build_id, process,
                    metric, metric_key, client_agg_type);
                """,
            ]
            + partitions,
            reverse_sql=["DROP TABLE glam_aggregation"]
            + [
                f"DROP MATERIALIZED VIEW view_glam_aggregation_{channel}"
                for channel in constants.CHANNEL_IDS.keys()
            ],
        )
    ]
