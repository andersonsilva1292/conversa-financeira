📄 Product Requirements Document (PRD)
- Produto: Finança IA – Inteligência Financeira Pessoal
- Autor: Anderson dos Santos Silva
- Data: Fevereiro/2026
  
**Este projeto foi desenvolvido com um Desafio de projeto da DIO de Vibe Coding utilizando o Lovable e o Copilot Web. 
A proposta é criar um aplicativo de organização financeira pessoal baseado em interações em linguagem Natural.**

**Refinado no Copilot Web**
```Markdown
# PRD – Aplicativo de Organização de Finanças Pessoais


## 1. Contexto
O aplicativo busca simplificar o controle financeiro por meio de conversas em linguagem natural, eliminando formulários complexos ou planilhas.  
A proposta é oferecer uma experiência fluida, acessível e inclusiva, com recomendações automáticas que apoiem o usuário em sua jornada de organização financeira.

---

## 2. Público-Alvo
- Pessoas que desejam iniciar o controle financeiro de forma prática.  
- Usuários iniciantes que buscam simplicidade e orientação amigável.  
- Indivíduos que se frustraram com apps tradicionais e querem uma alternativa mais natural.  
- Todos os perfis de usuários, independentemente de idade, nível de letramento digital ou possíveis limitações físicas ou cognitivas.  

---

## 3. Funcionalidades-Chave

### Painel
- Exibição de **Saldo Total da carteira**.  
- **Receitas e Despesas** com gráficos semanais e por categoria.  
- Lista de transações com opções de **editar/excluir**.  
- Saldo negativo exibido em **vermelho**.  

### Chat IA
- Interface conversacional com **saudações automáticas** (Bom dia, Boa tarde, Boa noite — horário de Brasília).  
- Sugestões rápidas e respostas simuladas.  
- Registro de transações via linguagem natural.  

### Metas
- Acompanhamento de metas financeiras.  
- Barras de progresso animadas.  

### Relatórios
- Gráficos de **barras, linha e pizza**.  
- Previsões futuras de saldo e gastos.  
- Filtros por categoria.  

### Login
- Tela de autenticação com cadastro.  
- Fluxo: **Login → Cadastre-se → Confirme email → Faça login → Comece a registrar manualmente ou via chat**.  
- Novo usuário inicia com dados zerados.  

---

## 4. Regras de Negócio
1. **Saldo Total** = Receitas – Despesas.  
2. **Despesa**: gasto registrado ao selecionar "Nova Transação".  
3. **Receita**: soma de entradas (salário, investimentos).  
4. Se **Despesa > Saldo Total**, o saldo fica **vermelho** e o usuário é informado que a carteira está sendo descontada.  
5. Texto na tela de transação:  
   - Valor positivo → `+1`  
   - Valor negativo → `-1`  

---

## 5. Integrações
- **Lovable Cloud**: autenticação real.  
- Banco de dados para transações.  
- Integração com IA para chat financeiro.  

---

## 6. Design Universal
- Compatível com leitores de tela.  
- Navegação simples para idosos.  
- Linguagem acessível para iniciantes.  
- Interação por voz para usuários com dificuldades motoras.  

---

## 7. Entregável da IA (MVP)
- Principais telas: **Chat, Metas, Relatórios, Gráficos**.  
- Recursos essenciais: NLP para chat, categorização automática, motor de recomendações, módulo de previsão.  
- Validação inicial: testes com usuários iniciantes e diversos perfis, feedback qualitativo.  
- Linguagem acessível e educativa, em português.  
- Garantia de que o design siga princípios de **Design Universal**.  

---

## 8. Rodapé
Discretamente incluir:  
**Desenvolvido por Anderson dos Santos Silva**

---
```

🎬 Interações com o Lovable
>Crie um App de Finanças Pessoais com base no seguinte PRD (Product Requirements Document): {PRD}
>Ativar o Lovable Cloud para adicionar autenticação real, o app no banco de dados para transações e integração com IA para o chat financeiro.
>Saldo Total carteira, Despesas e Gastos financeiros para abater no saldo da carteira. >Receitas Salário depositado ou investimento que também pode ser usado para pagar as contas.

**Resultado Final no Lovable:** https://1db72743-c7a0-4bf8-bfd2-c24f96f91f84.lovableproject.com/login
<img width="1755" height="840" alt="image" src="https://github.com/user-attachments/assets/f6599196-d165-4b47-a52a-59384fc28d48" />
<img width="1755" height="1225" alt="image" src="https://github.com/user-attachments/assets/d6344ba7-28e8-49cf-bdba-403fd78f9f93" />
<img width="1755" height="840" alt="image" src="https://github.com/user-attachments/assets/d36092ea-32d4-455e-a51e-b574f7110ab4" />
<img width="1755" height="840" alt="image" src="https://github.com/user-attachments/assets/3a63477e-6a59-4c9d-93dc-3b4ea0fc390d" />
<img width="1755" height="1087" alt="image" src="https://github.com/user-attachments/assets/c96200ad-6502-4d08-8f71-a369ba1c7be7" />


# 📱 Funcionalidades do Aplicativo de Organização Financeira

## Painel Financeiro
- Exibe **saldo total da carteira**.
- Mostra **receitas e despesas** em gráficos semanais e por categoria.
- Lista de transações com opção de **editar ou excluir**.
- Saldo negativo destacado em **vermelho**.

## Chat com IA
- Registro de transações via **linguagem natural**.
- Saudações automáticas conforme horário (Bom dia, Boa tarde, Boa noite).
- Sugestões rápidas e respostas simuladas.

## Metas
- Criação e acompanhamento de **metas financeiras**.
- Barras de progresso animadas para motivação.

## Relatórios
- Gráficos em **barras, linha e pizza**.
- Previsões futuras de saldo e gastos.
- Filtros por categoria para análise detalhada.

## Login e Cadastro
- Fluxo simples: **Cadastro → Confirmação de email → Login**.
- Usuário novo inicia com dados zerados.
- Autenticação via **Lovable Cloud**.

## Regras de Negócio
- **Saldo Total = Receitas – Despesas**.
- Valores positivos (+) e negativos (–) identificados automaticamente.
- Alerta visual quando despesas superam saldo.

## Design Universal
- Compatível com **leitores de tela**.
- Navegação simplificada para **idosos e iniciantes**.
- Interação por **voz** para acessibilidade.

## Integrações
- Banco de dados para transações.
- IA para chat, categorização automática e previsões.
- Motor de recomendações financeiras.

---
🔎 Visão Geral do App
Finança IA é uma aplicação web que auxilia usuários na organização de suas finanças pessoais, utilizando IA para oferecer insights, recomendações e automação de tarefas financeiras.

🎯 Objetivo: Gestão simplificada e inteligente das finanças pessoais, com suporte à tomada de decisão baseada em dados.

👥 Público-Alvo:
- Pessoas físicas que desejam controlar gastos e receitas.
- Usuários com pouca familiaridade em planejamento financeiro.
- Jovens adultos e profissionais que buscam ferramentas digitais para organização financeira.

📊 Funcionalidades Principais:
- Cadastro e login seguro.


Versão 1.0 (6 meses): IA para recomendações, relatórios automáticos.

Versão 2.0 (12 meses): Exportação de dados, integração com bancos.
