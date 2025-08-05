from app import create_app
from app.extensions import db
from app.models import User
import click

app = create_app()

@app.cli.command("create-admin")
@click.argument("username")
@click.argument("email")
@click.argument("password")
def create_admin_user(username, email, password):
    with app.app_context():
        if User.query.filter_by(username=username).first():
            print(f"Usuario {username} ya existe.")
            return
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"Usuario admin '{username}' creado exitosamente.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
