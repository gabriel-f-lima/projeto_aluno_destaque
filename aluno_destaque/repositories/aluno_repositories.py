import psycopg2

class AlunoRepository:
    def __init__(self, get_db_connection):
        self.get_db_connection = get_db_connection

    # 1. Secretaria: Adiciona apenas os dados básicos do aluno
    def adicionar(self, nome, curso_id=None):
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            # Nota, presenca e cursos_ead entram como 0 por padrão
            cursor.execute("""
                INSERT INTO alunos (nome, nota, presenca, cursos_ead, curso_id)
                VALUES (%s, 0, 0, 0, %s) RETURNING id;
            """, (nome, curso_id))
            novo_id = cursor.fetchone()[0]
            conn.commit()
            return novo_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    # 2. Professor: Lança ou atualiza as notas de um aluno que já existe
    def lancar_notas(self, aluno_id, nota, presenca, cursos_ead):
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                UPDATE alunos 
                SET nota = %s, presenca = %s, cursos_ead = %s
                WHERE id = %s;
            """, (nota, presenca, cursos_ead, aluno_id))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    # 3. Remover aluno
    def remover(self, aluno_id):
        conn = self.get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM alunos WHERE id = %s;", (aluno_id,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()