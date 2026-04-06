# Guia de Migração - Clepsydra Frontend

Este guia explica como migrar do projeto HTML estático para a nova versão React/TypeScript.

## 🚀 Principais Melhorias

### 1. **Arquitetura Moderna**
- **React 18** com TypeScript para melhor manutenibilidade
- **Componentes reutilizáveis** em vez de páginas HTML duplicadas
- **Roteamento** com React Router para navegação SPA
- **Estado global** com Context API

### 2. **Tecnologias Escaláveis**
- **Tailwind CSS** para estilização consistente
- **Leaflet Maps** para visualizações geográficas
- **TypeScript** para detecção de erros em tempo de desenvolvimento
- **ESLint + Prettier** para qualidade de código

### 3. **Performance e SEO**
- **Code splitting** automático
- **Lazy loading** de componentes
- **Service Worker** para funcionalidades offline
- **Otimização de build** para produção

## 📁 Estrutura de Arquivos

### Antiga (HTML)
```
/
├── index.html
├── about_c.html
├── tarefas.html
├── parceiros.html
└── images/
```

### Nova (React)
```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   └── MapComponent.tsx
├── pages/              # Páginas da aplicação
│   ├── HomePage.tsx
│   ├── AboutClepsydra.tsx
│   ├── Tasks.tsx
│   └── ...
├── contexts/           # Estado global
│   └── AppContext.tsx
├── utils/              # Funções utilitárias
└── assets/             # Recursos estáticos
```

## 🔄 Migração de Conteúdo

### 1. **Páginas HTML → Componentes React**

**Antes (about_c.html):**
```html
<div class="container">
  <h1>Sobre o Projeto</h1>
  <p>Conteúdo...</p>
</div>
```

**Depois (AboutClepsydra.tsx):**
```tsx
const AboutClepsydra: React.FC = () => {
  return (
    <div className="container">
      <h1>Sobre o Projeto</h1>
      <p>Conteúdo...</p>
    </div>
  );
};
```

### 2. **Estilos CSS → Tailwind**

**Antes:**
```css
.nav-link {
  position: relative;
  transition: all 0.3s ease;
}
.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #174192;
  transition: width 0.3s ease;
}
```

**Depois:**
```tsx
<Link className="relative transition-all duration-300 hover:after:w-full after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-clepsydra-blue after:transition-all after:duration-300">
  Navegação
</Link>
```

### 3. **Navegação**

**Antes:**
```html
<a href="about_c.html">Sobre</a>
```

**Depois:**
```tsx
import { Link } from 'react-router-dom';

<Link to="/about-c">Sobre</Link>
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format
```

### Produção
```bash
# Build para produção
npm run build

# Build sem source maps
npm run build:prod

# Analisar bundle
npm run analyze
```

## 📊 Benefícios da Migração

### 1. **Manutenibilidade**
- Código mais organizado e reutilizável
- Detecção de erros em tempo de desenvolvimento
- Padrões consistentes com ESLint/Prettier

### 2. **Performance**
- Carregamento mais rápido com code splitting
- Cache inteligente com service worker
- Otimizações automáticas de build

### 3. **Escalabilidade**
- Fácil adição de novas funcionalidades
- Componentes reutilizáveis
- Estado global gerenciado

### 4. **Experiência do Desenvolvedor**
- Hot reload em desenvolvimento
- TypeScript para melhor IntelliSense
- Ferramentas modernas de debugging

## 🔧 Próximos Passos

1. **Migrar conteúdo** das páginas HTML para componentes React
2. **Implementar funcionalidades** específicas (mapas, visualizações)
3. **Adicionar testes** para componentes críticos
4. **Configurar CI/CD** para deploy automático
5. **Otimizar performance** com lazy loading e memoização

## 📚 Recursos Adicionais

- [Documentação React](https://react.dev/)
- [Documentação TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação React Router](https://reactrouter.com/)
- [Documentação Leaflet](https://leafletjs.com/reference.html) 