from enum import Enum

from server import db


class ChannelTypes(Enum):
    nightly = 1
    beta = 2
    release = 3


class AggregateTypes(Enum):
    histogram = 1
    percentiles = 2


class FirefoxMeasurement(db.Model):
    __tablename__ = "fx_measurements"

    # Dimensions that make up the primary key.
    channel = db.Column(db.Enum(ChannelTypes), nullable=False, primary_key=True)
    version = db.Column(db.String(16), primary_key=True)
    agg_type = db.Column(db.Enum(AggregateTypes), nullable=False, primary_key=True)
    os = db.Column(db.String(16), primary_key=True)
    build_id = db.Column(db.String(16), primary_key=True)
    metric = db.Column(db.String(128), nullable=False, primary_key=True)
    metric_key = db.Column(db.String(128), primary_key=True)
    client_agg_type = db.Column(db.String(32), primary_key=True)
    # The data stored for each dimension.
    metric_type = db.Column(db.String(32), nullable=False)
    total_users = db.Column(db.Integer(), nullable=False)
    data = db.Column(db.JSON())

    def __repr__(self):
        return "<Measurement {metric!r}>".format(metric=self.metric.name)


class Probe(db.Model):
    __tablename__ = "probe"

    id = db.Column(db.String(200), primary_key=True)
    info = db.Column(db.JSON())

    def __repr__(self):
        return "<Probe {probe!r}>".format(probe=self.id)
