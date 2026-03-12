from flask import Blueprint, request, jsonify
from repositories.aluno_repositories import AlunoRepository

aluno_bp = Blueprint('aluno', __name__)
repo = None 

def init_controller(get_db_connection):
    global repo
    repo = AlunoRepository(get_db_connection)

# Rota 1: Cadastrar Aluno (Recebe apenas NOME e CURSO)
@aluno_bp.route('/aluno/cadastrar', methods=['POST'])
def cadastrar_aluno():
    dados = request.json
    try:
        novo_id = repo.adicionar(
            nome=dados['nome'],
            curso_id=dados.get('curso_id') 
        )
        return jsonify({"mensagem": "Aluno cadastrado com sucesso! Notas zeradas.", "id": novo_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Rota 2: Lançar Notas (Recebe as NOTAS para um ID específico)
@aluno_bp.route('/aluno/<int:id>/notas', methods=['PUT', 'POST'])
def lancar_notas(id):
    dados = request.json
    try:
        repo.lancar_notas(
            aluno_id=id,
            nota=dados['nota'],
            presenca=dados['presenca'],
            cursos_ead=dados['cursos_ead']
        )
        return jsonify({"mensagem": "Notas lançadas com sucesso para o aluno!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Rota 3: Remover Aluno
@aluno_bp.route('/aluno/remover/<int:id>', methods=['DELETE', 'POST'])
def remover_aluno(id):
    try:
        repo.remover(id)
        return jsonify({"mensagem": "Aluno removido com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500