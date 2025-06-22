const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// Substitua pelos dados do seu banco na Hostinger
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,  // por exemplo, 'l2bsolucoes.com.br'
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Teste a conexão
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
  } else {
    console.log('Conectado ao banco de dados!');
  }
});

// Rota para salvar dados do IMC
app.post('/api/imc', (req, res) => {
  const { nome, peso, altura, imc, classificacao } = req.body;
  console.log('Recebido:', { nome, peso, altura, imc, classificacao });

  if (!nome || !peso || !altura || !imc || !classificacao) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  db.query(
    'INSERT INTO imc_registros (nome, peso, altura, imc, classificacao) VALUES (?, ?, ?, ?, ?)',
    [nome, peso, altura, imc, classificacao],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao salvar no banco.' });
      }
      res.json({ success: true, id: result.insertId });
    }
  );

});

// Rota para listar todos os registros de IMC
app.get('/api/imc', (req, res) => {
  db.query('SELECT * FROM imc_registros ORDER BY criado_em DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
    res.json(results);
  });
});

// Atualizar registro
app.put('/api/imc/:id', (req, res) => {
  const { nome, peso, altura, imc, classificacao } = req.body;
  db.query(
    'UPDATE imc_registros SET nome=?, peso=?, altura=?, imc=?, classificacao=? WHERE id=?',
    [nome, peso, altura, imc, classificacao, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar.' });
      res.json({ success: true });
    }
  );
});

// Excluir registro
app.delete('/api/imc/:id', (req, res) => {
  db.query('DELETE FROM imc_registros WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir.' });
    res.json({ success: true });
  });
});

// Inicie o servidor
app.listen(3001, '0.0.0.0', () => {
  console.log('API rodando na porta 3001');
});

