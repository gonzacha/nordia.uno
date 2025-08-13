import uuid
from datetime import datetime
from flask import Flask, jsonify, render_template

from models import db, AuditSession
import audit_utils

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///audit.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/start-monitoring")
def start_monitoring():
    session = AuditSession()
    db.session.add(session)
    db.session.commit()
    audit_utils.start_monitoring(session.id)
    return jsonify({"session_id": session.id})


@app.route("/stop-monitoring")
def stop_monitoring():
    metrics = audit_utils.stop_monitoring()
    session = AuditSession.query.get(audit_utils.current_session_id)
    stress = audit_utils.run_stress_tests()
    report = audit_utils.generate_full_report(session.id, metrics, stress)
    session.report = report
    session.end_time = datetime.utcnow()
    db.session.commit()
    return jsonify(report)


@app.route("/report/<session_id>")
def report(session_id):
    session = AuditSession.query.get_or_404(session_id)
    return render_template("audit_report.html", report_json=session.report)


# API endpoints
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/metrics")
def api_metrics():
    return jsonify(audit_utils.get_current_metrics())


@app.route("/api/stress-test", methods=["POST"])
def api_stress():
    results = audit_utils.run_stress_tests()
    return jsonify(results)


@app.route("/api/server-info")
def api_server_info():
    return jsonify(audit_utils.get_server_info())


@app.route("/api/full-report")
def api_full_report():
    metrics = audit_utils.get_current_metrics()
    stress = audit_utils.run_stress_tests()
    session_id = audit_utils.current_session_id or str(uuid.uuid4())
    report = audit_utils.generate_full_report(session_id, metrics, stress)
    return jsonify(report)


if __name__ == "__main__":
    app.run(debug=True)
