

## QA dos filtros avançados e autocomplete de CEP

- **Filtros desktop (1280×720):** a loja exibiu os controlos de tamanho, cor e faixa de preço; os três filtros puderam ser combinados; o contador de resultados atualizou-se; e o botão “Limpar filtros” repôs os valores neutros.
- **Autocomplete mobile (375×812):** após inserir o CEP válido `01310100`, uma resposta ViaCEP controlada preencheu Rua/Avenida Paulista, Bairro/Bela Vista, Cidade/São Paulo e Estado/SP. O helper confirmou a morada encontrada e manteve os campos editáveis.
- **Validação técnica:** `pnpm exec tsc --noEmit`, 42 testes Vitest e `pnpm build` concluídos sem erros. O build manteve apenas o aviso informativo de chunk principal acima de 500 kB.
