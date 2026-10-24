# Urna — joguinho de votação

Simulador de urna eletrônica (só Presidente). A pessoa digita o número, aparece
o candidato com foto, aperta CONFIRMA e o voto é salvo. BRANCO, CORRIGE e voto
nulo funcionam como na urna de verdade.

O botão **VER VOTOS** (embaixo da urna) mostra a apuração e pede senha. A senha
padrão é `1907`; para trocar, crie a variável de ambiente `VOTOS_SENHA` no Netlify.
Na apuração tem o botão **Reiniciar votação**, que apaga todos os votos.

## Candidatos

Edite `js/candidatos.js` (nome, número de 2 dígitos, partido e foto). As fotos
ficam em `assets/candidatos/`.

## Publicar no Netlify

Netlify → **Add new site → Import an existing project** → escolha este
repositório → **Deploy**. Não precisa mudar nenhuma configuração.

Os votos ficam salvos no Netlify Blobs (store `urna-votos`), então os votos de
todo mundo que abrir o link entram na mesma contagem.
