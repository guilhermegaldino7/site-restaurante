import { useEffect, useState } from 'react';
import { Container, Typography, Button, TextField, Paper, Grid, Card, CardContent } from '@mui/material';
import { useForm } from 'react-hook-form';
import { api } from './services/api';

export default function App() {
  const [pratos, setPratos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  
  const formPrato = useForm();
  const formPedido = useForm();

  // Função que busca os dados do servidor
  const atualizarTela = async () => {
    try {
      const resPratos = await api.get('/pratos');
      const resPedidos = await api.get('/pedidos');
      setPratos(resPratos.data);
      setPedidos(resPedidos.data);
    } catch (error) {
      console.log("Servidor offline ou erro de conexão");
    }
  };

  // Atualiza a tela ao abrir e a cada 5 segundos
  useEffect(() => { atualizarTela(); }, []);
  useEffect(() => { const timer = setInterval(atualizarTela, 5000); return () => clearInterval(timer); }, []);

  const cadastrarPrato = async (dados: any) => {
    await api.post('/pratos', dados);
    formPrato.reset();
    atualizarTela();
  };

  const enviarPedido = async (dados: any) => {
    await api.post('/pedidos', dados);
    formPedido.reset();
    atualizarTela();
  };

  const pedidoPronto = async (id: string) => {
    await api.patch(`/pedidos/${id}/pronto`);
    atualizarTela();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f5f5f5', minHeight: '100vh', p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
        🍔 Fast Food System
      </Typography>

      <Grid container spacing={4}>
        {/* --- LADO ESQUERDO: GARÇOM --- */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>📝 Novo Pedido</Typography>
            <form onSubmit={formPedido.handleSubmit(enviarPedido)}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField {...formPedido.register('mesa')} label="Mesa" type="number" fullWidth required />
                </Grid>
                <Grid item xs={9}>
                  <TextField {...formPedido.register('descricao')} label="Pedido (Ex: 1 X-Bacon)" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" fullWidth>ENVIAR PARA COZINHA</Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6">➕ Cadastrar Prato</Typography>
            <form onSubmit={formPrato.handleSubmit(cadastrarPrato)} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <TextField {...formPrato.register('nome')} label="Nome" size="small" />
              <TextField {...formPrato.register('preco')} label="Preço" type="number" size="small" />
              <TextField {...formPrato.register('categoria')} label="Categ." size="small" />
              <Button type="submit" variant="outlined">Add</Button>
            </form>
            <div style={{ marginTop: 15 }}>
              {pratos.map(p => (
                <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: 5 }}>
                  {p.nome} - R$ {p.preco}
                </div>
              ))}
            </div>
          </Paper>
        </Grid>

        {/* --- LADO DIREITO: COZINHA --- */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff3e0', minHeight: '600px' }}>
            <Typography variant="h4" align="center" gutterBottom>👨‍🍳 Monitor da Cozinha</Typography>
            
            {pedidos.length === 0 && <Typography align="center" sx={{ mt: 10, color: 'gray' }}>Sem pedidos...</Typography>}
            
            {pedidos.map(ped => (
              <Card key={ped.id} sx={{ mb: 2, borderLeft: '8px solid #ed6c02' }}>
                <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>MESA {ped.mesa}</Typography>
                    <Typography variant="h6">{ped.descricao}</Typography>
                  </div>
                  <Button variant="contained" color="success" size="large" onClick={() => pedidoPronto(ped.id)}>
                    PRONTO!
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}