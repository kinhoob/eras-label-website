# Mapeamento do domínio eraslabel.com

Este documento prepara o projeto para o lançamento no domínio próprio **eraslabel.com**. Nenhum registro DNS foi alterado e nenhuma publicação foi executada nesta etapa.

## Pré-condições

O projeto precisa ter um checkpoint aprovado e uma versão publicada no painel de gestão. O domínio deve estar sob controle do proprietário na HostGator, com acesso ao editor de zona DNS. Os valores exatos de apontamento devem ser copiados do painel de gestão do projeto; não devem ser inventados ou reutilizados de outro site.

## Procedimento recomendado

1. Abra o projeto no painel de gestão e entre em **Settings → Domains**.
2. Escolha a opção para adicionar ou vincular um domínio existente e informe `eraslabel.com`.
3. Copie exatamente os registros exibidos pelo painel para o domínio raiz e para `www`, incluindo tipo, nome/host, valor, prioridade e TTL quando esses campos forem apresentados.
4. No painel da HostGator, abra o editor de zona DNS e substitua apenas registros conflitantes de website. Preserve os registros de e-mail já verificados do Resend, incluindo DKIM, SPF e DMARC.
5. Se o painel fornecer um CNAME para `www`, use o valor exibido pelo painel sem acrescentar um ponto ou modificar o hostname. Para o domínio raiz, use o tipo de registro recomendado pela própria tela de domínios.
6. Salve a zona DNS, aguarde a propagação e volte ao painel de gestão para executar a verificação do domínio.
7. Depois que o certificado HTTPS aparecer como ativo, valide `https://eraslabel.com`, `https://www.eraslabel.com`, a rota `/admin` e o fluxo de checkout.

## Checklist de segurança e operação

| Item | Estado | Observação |
|---|---|---|
| Credenciais administrativas | Preparado | O login do painel continua protegido por segredo de ambiente e RBAC. |
| Resend DKIM/SPF/DMARC | Preservar | Não remover ao editar a zona da HostGator. |
| Domínio raiz | A configurar no painel | Usar os valores apresentados pelo painel de gestão. |
| Subdomínio `www` | A configurar no painel | Usar o CNAME exato apresentado pelo painel. |
| HTTPS | A verificar após DNS | Não considerar o domínio pronto antes do certificado ativo. |
| Redirecionamento entre raiz e `www` | A verificar | Manter uma versão canônica para evitar URLs duplicadas. |
| Publicação | Não executada | A publicação deve ser feita manualmente pelo botão Publish após revisão. |

## Validação pós-configuração

Confirmar que a página inicial carrega sem recursos mistos, que as imagens de banners e produtos continuam disponíveis, que o carrinho preserva o estado, que o checkout retorna à página de sucesso e que usuários não autenticados continuam recebendo a tela de login ao abrir `/admin`.

> Os valores de DNS devem sempre vir da tela de domínios do projeto. Este arquivo é um roteiro de operação, não uma autorização para publicar ou alterar registros automaticamente.
