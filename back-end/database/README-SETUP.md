# Setup do Banco de Dados - ScaleX English Course

## 📋 **Arquivos Disponíveis**

### **1. Estrutura do Banco (`init.sql`)**
- ✅ **Apenas schema** (tabelas, índices, constraints)
- ✅ **Sem dados de exemplo**
- ✅ **Pronto para produção**

### **2. Dados Básicos (`english-course-basic-data.sql`)**
- ✅ **3 lições básicas** (números 1-3)
- ✅ **6 perguntas de exemplo**
- ✅ **Dados mínimos para teste**

### **3. Dados Completos (`english-course-sample-data-fixed.sql`)**
- ✅ **12 lições completas** (números 1-12)
- ✅ **40+ perguntas** distribuídas
- ✅ **Todos os níveis** (beginner → advanced)
- ✅ **Dados completos para desenvolvimento**

## 🚀 **Instruções de Setup**

### **Opção 1: Setup Mínimo (Apenas Estrutura)**
```bash
# Apenas cria as tabelas, sem dados
psql -U seu_usuario -d seu_banco < back-end/database/init.sql
```

### **Opção 2: Setup Básico (Estrutura + Dados Básicos)**
```bash
# 1. Cria as tabelas
psql -U seu_usuario -d seu_banco < back-end/database/init.sql

# 2. Adiciona dados básicos (3 lições)
psql -U seu_usuario -d seu_banco < back-end/database/english-course-basic-data.sql
```

### **Opção 3: Setup Completo (Estrutura + Dados Completos)**
```bash
# 1. Cria as tabelas
psql -U seu_usuario -d seu_banco < back-end/database/init.sql

# 2. Adiciona todos os dados (12 lições)
psql -U seu_usuario -d seu_banco < back-end/database/english-course-sample-data-fixed.sql
```

## 📊 **Conteúdo dos Dados**

### **Lições Básicas (1-3):**
- **Lição 1**: Introduction to Basic Questions (4 perguntas)
- **Lição 2**: Actions and Present Continuous (2 perguntas)  
- **Lição 3**: Prepositions of Place (0 perguntas - apenas estrutura)

### **Lições Adicionais (4-12):**
- **Beginner (2 lições)**: Numbers & Counting, Days & Time
- **Elementary (2 lições)**: Food & Drinks, Family & Relationships
- **Intermediate (3 lições)**: Past Simple Regular, Past Simple Irregular, Future Plans
- **Advanced (2 lições)**: Present Perfect, First Conditional

## ⚙️ **Configuração da Aplicação**

### **Variáveis de Ambiente:**
```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=seu_banco
```

### **Iniciar Aplicação:**
```bash
# Backend
cd back-end
npm install
npm run start:dev

# Frontend
cd front-end
npm install
npm run dev
```

## 🔧 **Verificação**

### **Testar Conexão:**
```bash
# Verificar se as tabelas foram criadas
psql -U seu_usuario -d seu_banco -c "\dt english_*"

# Verificar dados inseridos
psql -U seu_usuario -d seu_banco -c "SELECT COUNT(*) FROM english_lessons;"
psql -U seu_usuario -d seu_banco -c "SELECT COUNT(*) FROM english_questions;"
```

### **Testar API:**
```bash
# Verificar se a API está funcionando
curl http://localhost:3000/english-course/lessons
```

## 📝 **Notas Importantes**

1. **Ordem de Execução**: Sempre execute `init.sql` primeiro
2. **Conflitos**: Todos os scripts usam `ON CONFLICT DO NOTHING`
3. **Produção**: Use apenas `init.sql` em produção
4. **Desenvolvimento**: Use `english-course-sample-data-fixed.sql` para dados completos

## 🎯 **Resultado Esperado**

Após executar o setup completo:
- ✅ **12 lições** disponíveis na aplicação
- ✅ **40+ perguntas** para prática
- ✅ **Sistema Anki** funcionando
- ✅ **4 níveis de dificuldade** implementados
- ✅ **Aplicação pronta** para uso
