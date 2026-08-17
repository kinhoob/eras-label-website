# Guia Operacional de Expedição, Declaração de Conteúdo e Notas Fiscais — Eras Label

## 1. Introdução e Contexto Operacional

No comércio eletrônico de vestuário e streetwear, a expedição de mercadorias exige rigor documental para garantir a conformidade legal perante os órgãos de fiscalização estadual e federal, bem como a segurança indenizatória junto às transportadoras parceiras (como Correios e Jadlog, utilizadas pela **Eras Label**) [1] [5]. 

Com a maturidade da plataforma e a integração nativa ao **Melhor Envio**, o lojista dispõe de duas vias principais para acompanhar o transporte físico das peças: a **Declaração de Conteúdo Eletrônica (DC-e)** e a **Nota Fiscal Eletrônica de Venda (NF-e, Modelo 55)** [1] [2]. O presente documento sintetiza o funcionamento de ambas, as obrigações aplicáveis ao modelo de negócio e as recomendações práticas para a operação diária da marca.

---

## 2. Declaração de Conteúdo vs. Nota Fiscal Eletrônica

A legislação brasileira de transporte de cargas fracionadas exige que todo volume despachado esteja acompanhado por um documento de idoneidade fiscal. A tabela abaixo resume as principais distinções operacionais e jurídicas entre as duas modalidades aceitas no ecossistema logístico:

| Critério | Declaração de Conteúdo (DC-e) | Nota Fiscal Eletrônica (NF-e - Modelo 55) |
| :--- | :--- | :--- |
| **Exigência Legal** | Permitida para remetentes pessoas físicas ou MEIs em operações dispensadas de emissão de NF-e para consumidor final não contribuinte [9] [15]. | Obrigatória para empresas inscritas no regime normal ou Simples Nacional (exceto MEIs em vendas para pessoa física, salvo exigência de circulação estadual específica) [9] [15]. |
| **Geração na Plataforma** | Gerada diretamente no painel do Melhor Envio ou via API no momento da postagem da etiqueta. | Emitida através de um sistema emissor de NF-e (Sefaz ou ERP integrado) utilizando o certificado digital (e-CNPJ) [11]. |
| **Seguro e Indenização** | Cobertura padrão limitada pelas regras da transportadora; em algumas transportadoras (como a Jadlog), tetos de indenização por avaria/extravio podem ter restrições específicas [3] [4]. | Cobertura integral garantida mediante comprovação de valor declarada no DANFE/Chave de Acesso [3]. |
| **Fixação no Pacote** | Impressa e colada na parte externa da embalagem (em envelope plásfico canguru) junto à etiqueta de envio. | O DANFE (Documento Auxiliar da Nota Fiscal Eletrônica) deve ser fixado externamente, acompanhado do XML transmitido à transportadora [2]. |

---

## 3. Diretrizes para a Operação da Eras Label

### 3.1. Quando Utilizar a Declaração de Conteúdo
A Declaração de Conteúdo é o instrumento ideal para o início das operações e para microempreendedores em fase de transição estrutural. Ela descreve os itens despachados, os dados do remetente (Kinho / Eras Label) e do destinatário (cliente final), além de declarar o valor total dos produtos. 

* **Vantagens:** Agilidade operacional imediata, sem necessidade de integração complexa com SEFAZ estadual no primeiro dia.
* **Cuidados:** É fundamental preencher com exatidão a quantidade de peças, a descrição clara (ex: *Camiseta Oversized Eras - Algodão Premium*) e o valor monetário real, evitando divergências na fiscalização de postagem dos Correios ou da Jadlog [1] [8].

### 3.2. Transição para a Nota Fiscal Eletrônica (NF-e)
À medida que a **Eras Label** escala o faturamento e consolida sua presença no mercado de streetwear de alto padrão, a emissão da **NF-e Modelo 55** torna-se o padrão recomendável de excelência e segurança jurídica [2]:
1. **Credenciamento Estadual:** Obtenção da Inscrição Estadual junto à Secretaria da Fazenda do estado de origem [11].
2. **Certificado Digital:** Aquisição de um certificado digital e-CNPJ (modelo A1 ou A3) [11].
3. **Emissor Homologado:** Contratação de um sistema emissor de notas fiscais integrado ao e-commerce (via API ou ERP) para automatizar a emissão e o envio do XML ao Melhor Envio no momento em que o pagamento for aprovado pelo Mercado Pago.

---

## 4. Integração Prática com o Melhor Envio e o Painel Administrativo

No painel administrativo da **Eras Label**, a gestão de pedidos já contempla o vínculo com o Melhor Envio para a geração de etiquetas de postagem (Correios PAC/Sedex e Jadlog Econômico/Rápido). Para otimizar a expedição:

1. **Dados do Destinatário:** O checkout transparente captura o CPF/CNPJ, endereço completo e CEP validados, preenchendo automaticamente os campos exigidos pela transportadora.
2. **Geração de Etiquetas:** Na aba de Vendas do painel, o administrador pode cotar, selecionar a modalidade e gerar a etiqueta de frete [1].
3. **Documento de Acompanhamento:** O sistema deve sempre garantir que o documento gerado (seja a DC-e gerada no portal de fretes ou a chave da NF-e informada no despacho) acompanhe fisicamente o pacote, assegurando trânsito fluido e entrega sem retenções em barreiras fiscais interestaduais [1] [2].

---

## 5. Recomendações e Próximos Passos

1. **Validação de Dados no Checkout:** Assegurar que o campo de CPF/CNPJ dos clientes continue com validação estrita no checkout para evitar rejeições na emissão de etiquetas e documentos fiscais [1].
2. **Organização das Declarações:** Imprimir sempre duas vias da declaração de conteúdo quando aplicável: uma afixada do lado de fora na embalagem plástica e outra de controle interno.
3. **Planejamento Contábil:** Consultar um contador para formalizar o enquadramento fiscal definitivo da marca (MEI, Simples Nacional ou Microempresa), habilitando o emissor de NF-e automatizado assim que o volume de envios diários justificar a automação completa [11].

---

## 6. Referências

- [1] Central de Ajuda do Melhor Envio. *Quais são os documentos fiscais que podem acompanhar os meus envios?* Disponível em: `https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220384848148` [1].
- [2] Central de Ajuda do Melhor Envio. *Como funciona a Jadlog pelo Melhor Envio: Regras de embarque*. Disponível em: `https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220462480788` [2].
- [3] Blog Melhor Envio. *Nota fiscal x declaração de conteúdo*. Disponível em: `https://melhorenvio.com.br/blog/frete-e-logistica/nota-fiscal-e-declaracao-de-conteudo/` [5].
- [4] Portal Gov.br. *Nota Fiscal para Empreendedor (MEI)*. Disponível em: `https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/nota-fiscal` [9].
- [5] Portal Tributário. *Simples Nacional - Expressões Obrigatórias na Nota Fiscal*. Disponível em: `https://www.portaltributario.com.br/guia/simples_nf.htm` [13].
