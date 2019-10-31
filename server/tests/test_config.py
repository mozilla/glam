class TestConfig:
    def test_config(self, app):
        assert app.config["TESTING"] is True
        assert app.testing is True

    def test_db(self, app):
        assert app.config["SQLALCHEMY_DATABASE_URI"] == "sqlite:///:memory:"
