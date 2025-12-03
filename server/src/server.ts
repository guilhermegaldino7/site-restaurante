import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// ROTA DE PRATOS (Cardápio)
app.get('/pratos', async (req, res) => {
  const pratos = await prisma.prato.findMany();
  res.json(pratos);
});

app.post('/pratos', async (req, res) => {
  const schema = z.object({
    nome: z.string(),
    preco: z.coerce.number(),
    categoria: z.string()
  });
  await prisma.prato.create({ data: schema.parse(req.body) });
  res.status(201).send();
});

// ROTA DE PEDIDOS (Cozinha)
app.get('/pedidos', async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    where: { status: 'PENDENTE' },
    orderBy: { createdAt: 'desc' }
  });
  res.json(pedidos);
});

app.post('/pedidos', async (req, res) => {
  const schema = z.object({
    mesa: z.coerce.number(),
    descricao: z.string(),
  });
  await prisma.pedido.create({ data: schema.parse(req.body) });
  res.status(201).send();
});

app.patch('/pedidos/:id/pronto', async (req, res) => {
  await prisma.pedido.update({
    where: { id: req.params.id },
    data: { status: 'PRONTO' }
  });
  res.send();
});

app.listen(3333, () => console.log('🔥 Servidor rodando na porta 3333'));