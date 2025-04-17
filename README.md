<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Wallet System

### 📌 Sobre a aplicação

Esta aplicação é uma **carteira digital** que permite aos usuários realizar **transações financeiras** entre si, com foco em segurança, testes e escalabilidade. Ela é construída com **NestJS** e utiliza **Prisma ORM** para comunicação com um banco de dados PostgreSQL.

---

### 🔐 Autenticação

Os usuários se autenticam por meio de um sistema de login com **JWT (JSON Web Tokens)**. Após a autenticação, o token é utilizado nas requisições protegidas, garantindo que apenas usuários autorizados possam acessar determinadas rotas, como a de transferência de saldo.

---

### 💸 Funcionalidade principal

A principal funcionalidade da aplicação é permitir **transferências de saldo entre usuários**. Para isso, o sistema:

- Valida se o remetente está autenticado;
- Verifica o saldo disponível;
- Registra a transação com tipo, valor, descrição, data e envolvidos;
- Atualiza os saldos de ambos os usuários de forma atômica.

---

### 🧪 Testes E2E

A aplicação possui uma **estrutura de testes E2E (end-to-end)** robusta, utilizando `supertest` e `jest`. Os testes são executados com **bancos de dados isolados por schema**, permitindo que cada suíte de testes rode de forma paralela e segura.

Para isso:

- Um schema aleatório é gerado para cada execução;
- O Prisma utiliza esse schema como base de dados temporária;
- Ao final, o schema é descartado, garantindo um ambiente limpo e controlado.

---

### 🧰 Tecnologias utilizadas

- **NestJS** — Framework principal da aplicação
- **Prisma ORM** — Abstração de banco de dados
- **PostgreSQL** — Banco de dados relacional
- **JWT** — Autenticação e autorização
- **bcryptjs** — Criptografia de senhas
- **Jest + Supertest** — Testes E2E automatizados

---

### Project setup

```bash
$ pnpm install
```

#### Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

#### Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
