# Configuração do Supabase para Clepsydra

## Passos para Configurar a Ligação com o Supabase

### 1. Criar Projeto no Supabase
1. Aceda a [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote o **URL** e **anon key** do projeto

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Estrutura das Tabelas

O projeto espera as seguintes tabelas no Supabase:

#### `condut_tejo_loc`
- `id` (int4, primary key)
- `data` (timestamptz)
- `codigo` (varchar)
- `condutividade` (numeric)
- `condcamp20c` (numeric)
- `coord_x_m` (numeric)
- `coord_y_m` (numeric)
- `altitude_m` (text)
- `sistema_aquifero` (text)
- `estado` (text)
- `freguesia` (text)
- `created_at` (timestamptz)

#### `nitrato_tejo_loc`
- `id` (int4, primary key)
- `data` (timestamptz)
- `codigo` (varchar)
- `nitrato` (text)
- `coord_x_m` (numeric)
- `coord_y_m` (numeric)
- `altitude_m` (text)
- `sistema_aquifero` (text)
- `estado` (text)
- `freguesia` (text)
- `created_at` (timestamptz)

#### `piezo_tejo_loc`
- `id` (int4, primary key)
- `data` (timestamptz)
- `codigo` (varchar)
- `nivel_piezometrico` (text)
- `profundidade_nivel_piezometrico` (text)
- `coord_x_m` (numeric)
- `coord_y_m` (numeric)
- `altitude_m` (numeric)
- `sistema_aquifero` (text)
- `estado` (text)
- `freguesia` (text)
- `created_at` (timestamptz)

#### `precipitacao_tejo_loc`
- `id` (int4, primary key)
- `data` (timestamptz)
- `codigo` (varchar)
- `precipitacao_dia_mm` (numeric)
- `nome` (text)
- `coord_x_m` (text)
- `coord_y_m` (text)
- `created_at` (timestamptz)

### 4. Configurar Políticas de Segurança

No Supabase, configure as políticas RLS (Row Level Security):

```sql
-- Permitir leitura pública para todas as tabelas
ALTER TABLE condut_tejo_loc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON condut_tejo_loc FOR SELECT USING (true);

ALTER TABLE nitrato_tejo_loc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON nitrato_tejo_loc FOR SELECT USING (true);

ALTER TABLE piezo_tejo_loc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON piezo_tejo_loc FOR SELECT USING (true);

ALTER TABLE precipitacao_tejo_loc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON precipitacao_tejo_loc FOR SELECT USING (true);
```

### 5. Importar Dados

1. No Supabase Dashboard, vá para **Table Editor**
2. Crie as tabelas conforme a estrutura acima
3. Importe os dados CSV ou use a API para inserir dados

### 6. Testar a Ligação

1. Configure as variáveis de ambiente
2. Execute `npm start`
3. Aceda à página Visual
4. Verifique se os dados aparecem no mapa

### 7. Troubleshooting

#### Erro de CORS
- Verifique se o domínio está configurado no Supabase
- Para desenvolvimento local, adicione `localhost:3000`

#### Erro de Autenticação
- Verifique se as variáveis de ambiente estão corretas
- Confirme se a anon key está correta

#### Dados não aparecem
- Verifique se as tabelas existem
- Confirme se as políticas RLS estão configuradas
- Verifique se há dados nas tabelas

### 8. Coordenadas

As coordenadas devem estar em formato UTM (zone 29N para Portugal).
O sistema converte automaticamente para lat/lng para exibição no mapa.

### 9. Sistema Aquífero

Os valores esperados para `sistema_aquifero` são:
- `AL` - Aluviões
- `ME` - Margem Esquerda  
- `MD` - Margem Direita 