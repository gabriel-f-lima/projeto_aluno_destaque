import os
import psycopg2
from flask import Flask, render_template
from dotenv import load_dotenv

from controllers.aluno_controller import aluno_bp, init_controller
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')  # Defina uma chave secreta para sessões

# 3. Função que ensina o Flask a conectar no seu PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )

init_controller(get_db_connection)

app.register_blueprint(aluno_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)