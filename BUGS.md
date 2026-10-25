# Problemas encontrados

Cada problema tem um teste automatizado com a mesma tag e uma [Issue](https://github.com/3mcp/qa-api-challenge/issues) no GitHub.

| ID | Endpoint | Cenário | Obtido | Esperado | Severidade | Issue |
|----|----------|---------|--------|----------|------------|-------|
| BUG-01 | `POST /booking` | Campo obrigatório ausente | `500 Internal Server Error` | `400 Bad Request` indicando o campo | Alta | [#1](https://github.com/3mcp/qa-api-challenge/issues/1) |
| BUG-02 | `POST /booking`, `PATCH /booking/:id` | `totalprice` enviado como texto | `200`, salvo como `null` | `400` | Crítica | [#2](https://github.com/3mcp/qa-api-challenge/issues/2) |
| BUG-03 | `POST /booking` | Data inválida `2026-13-45` | `200`, salvo como `0NaN-aN-aN` | `400` | Crítica | [#3](https://github.com/3mcp/qa-api-challenge/issues/3) |
| BUG-04 | `POST /booking` | Data `10/11/2026` | `200`, salvo como `2026-10-11` | `400`, aceitar só o formato ISO 8601 | Alta | [#4](https://github.com/3mcp/qa-api-challenge/issues/4) |
| BUG-05 | `POST /booking`, `PATCH /booking/:id` | Checkout antes do checkin | `200` | `400` | Alta | [#5](https://github.com/3mcp/qa-api-challenge/issues/5) |
| BUG-06 | `POST /booking` | `totalprice` negativo | `200` | `400` | Média | [#6](https://github.com/3mcp/qa-api-challenge/issues/6) |
| BUG-07 | `POST` vs `PUT` | Mesmo campo ausente | `500` no POST, `400` no PUT | Mesma validação nos dois | Média | [#7](https://github.com/3mcp/qa-api-challenge/issues/7) |
| BUG-08 | `DELETE /booking/:id` | Exclusão com sucesso | `201 Created` | `200 OK` ou `204 No Content` | Baixa | [#8](https://github.com/3mcp/qa-api-challenge/issues/8) |
| BUG-09 | `DELETE /booking/:id` | Reserva já excluída | `405 Method Not Allowed` | `404 Not Found` | Baixa | [#9](https://github.com/3mcp/qa-api-challenge/issues/9) |
| BUG-10 | `POST /auth` | Credenciais inválidas | `200` + `{"reason":"Bad credentials"}` | `401 Unauthorized` | Média | [#10](https://github.com/3mcp/qa-api-challenge/issues/10) |
| BUG-11 | `PUT`, `PATCH`, `DELETE` | Sem token | `403 Forbidden` | `401 Unauthorized` | Baixa | [#11](https://github.com/3mcp/qa-api-challenge/issues/11) |

## Análise

Os problemas mais graves são o BUG-02 e o BUG-03. A API responde `200`, então quem chamou acha que a reserva foi salva certinho, mas o preço fica `null` ou a data vira `0NaN-aN-aN`. Nenhum erro aparece, e o problema só seria descoberto depois, na cobrança ou no check-in.

O BUG-04 é um risco real para usuários brasileiros: `10/11/2026` para a gente é 10 de novembro, mas a API entende como 11 de outubro e salva sem avisar.

O BUG-01 e o BUG-07 mostram que a validação não é igual entre os endpoints: o mesmo campo faltando dá `400` no PUT e `500` no POST. Além disso, um `500` para um erro de quem chamou a API gera alertas falsos de servidor fora do ar.

O BUG-10 engana qualquer sistema que olhe só o status da resposta, já que um login que falhou retorna `200`.

## Outras observações

- O `GET /ping` retorna `201 Created`. Está de acordo com a documentação da API, mas um healthcheck deveria retornar `200 OK`.
- As respostas de erro vêm em texto puro (`Not Found`, `Forbidden`), sem um JSON indicando qual campo está errado.
- A API é pública e compartilhada, então os testes não usam IDs fixos e apagam tudo o que criam.
