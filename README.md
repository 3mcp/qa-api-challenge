# QA API Challenge

Testes automatizados da API [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) com Cypress e JavaScript.

## Pré-requisitos

- Node.js (versão LTS)
- Git

## Instalação

```bash
git clone https://github.com/3mcp/qa-api-challenge.git
cd qa-api-challenge
npm install
```

## Configuração

As credenciais não ficam no código. Copie o arquivo de exemplo e preencha com o usuário e a senha de teste que estão na [documentação da API](https://restful-booker.herokuapp.com/apidoc/index.html):

```bash
cp .env.example .env
```

O `.env` está no `.gitignore`. No GitHub Actions, as credenciais vêm dos secrets `API_USER` e `API_PASSWORD`.

## Execução

```bash
npm test
```

Ao final, o relatório HTML fica em `cypress/reports/index.html`.

## Evidências

Os testes rodam no GitHub Actions a cada push. O resultado de cada execução está na aba [Actions](https://github.com/3mcp/qa-api-challenge/actions), com o relatório HTML anexado como `cypress-report`.

## Organização

```
cypress/
├── e2e/api/
│   ├── healthcheck.cy.js
│   ├── bookings.cy.js
│   └── authentication.cy.js
└── support/
    ├── commands.js
    ├── factories.js
    └── e2e.js
```

Mantive a estrutura sugerida no desafio e adicionei:

- `healthcheck.cy.js`, para saber logo de cara se a API está no ar antes de olhar os outros testes;
- a pasta `support`, com o comando `cy.api` (evita repetir headers e `failOnStatusCode` em todo teste), o `cy.getToken` e a função `buildBooking`, que monta uma reserva válida.

## Como os testes funcionam

Cada teste valida o status HTTP e o corpo da resposta, conferindo os campos e os tipos.

Como a API é pública e outras pessoas também criam e apagam reservas, nenhum teste depende de um ID fixo. Cada teste cria a própria reserva e, no final, todas as reservas criadas são apagadas.

Os testes marcados com `[BUG-xx]` confirmam o comportamento atual da API, mesmo quando ele está errado. Se a API for corrigida, o teste falha e avisa que o comportamento mudou.

## Problemas encontrados

Estão no [BUGS.md](./BUGS.md) e também abertos como [Issues](https://github.com/3mcp/qa-api-challenge/issues).

## Cenários futuros

- Validar o contrato das respostas com JSON Schema
- Testar valores limite no preço e nos campos de texto
- Testar os filtros do `GET /booking` por nome e por data
- Testes de segurança, como injeção nos campos de texto e expiração do token
- Testes de performance com k6
- Requisições e respostas em XML
