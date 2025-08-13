import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class AuditSession(db.Model):
    __tablename__ = "audit_sessions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    report = db.Column(db.JSON)

    def to_dict(self):
        return {
            "session_id": self.id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "report": self.report or {},
        }
