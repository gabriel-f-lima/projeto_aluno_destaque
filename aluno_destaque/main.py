from flask import Flask, render_template

# Inicializa o aplicativo Flask
app = Flask(__name__)

# Rota principal (página inicial)
@app.route('/')
def index():
    # O Flask procura automaticamente dentro da pasta 'templates'
    return render_template('index.html')

# Inicia o servidor
if __name__ == '__main__':
    # O debug=True recarrega o servidor automaticamente quando você salva o código
    app.run(debug=True)