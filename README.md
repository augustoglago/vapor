# 🎮 Vapor

Um aplicativo para organizar sua vida gamer: crie listas de jogos, acompanhe suas conquistas e monte pastas personalizadas com seus interesses.  
O objetivo do projeto é oferecer uma forma simples, moderna e intuitiva de gerenciar sua biblioteca e progresso em jogos.

## 📋 Sobre o Projeto

O **Vapor** é o aplicativo móvel desenvolvido em **React Native** que se conecta à **Vapor API**. Nosso objetivo é criar uma experiência de gerenciamento de listas personalizada para jogos da Steam, similar a plataformas como Pinterest ou MyAnimeList, mas focada no universo gamer.

Os usuários podem:
Os usuários podem:
* Criar e gerenciar **listas personalizadas** (ex: "Jogados", "Lista de Desejos", "Favoritos", etc.).
* Visualizar **informações detalhadas** dos jogos, integradas com a Steam.
* Acompanhar **conquistas** e status de jogo.


Este projeto faz parte de uma arquitetura maior, onde:
* **Frontend**: [Vapor](https://github.com/augustoglago/vapor) `React Native`;
* **Backend**: [Vapor API](https://github.com/lucas-0331/project) `NodeJS`.

---

## 🏗️ Infraestrutura

- **Modelagem do Banco**: [drawDB](https://www.drawdb.app/)
    - [https://www.drawdb.app/editor?shareId=2c02833a1771f681013881c8d7be846d](https://www.drawdb.app/editor?shareId=2c02833a1771f681013881c8d7be846d)
- **Hospedagem da API**: [Render](https://render.com/)
    - [https://vapor-73xs.onrender.com/](https://vapor-73xs.onrender.com/)
- **Banco de Dados**: [Aiven](https://aiven.io/) 
    - PostgreSQL

---

## 🚀 Tecnologias Utilizadas

A stack deste projeto combina **React Native** com **Expo** para um desenvolvimento rápido e eficiente, focando em performance e uma experiência de usuário rica.

### 📱 Core & Ambiente
* **React Native** `react`, `react-native`: Framework principal para construção da interface móvel.
* **Expo** `expo`, `expo-router`: Gerencia o ciclo de vida do projeto, roteamento via `expo-router` e acesso a APIs nativas.
* **TypeScript** `typescript`: Garante tipagem e maior robustez ao código.

### 🎨 Interface & Estilização
* **NativeWind** `nativewind`, `tailwindcss`: Permite o uso da sintaxe **Tailwind CSS** para estilização, facilitando o design responsivo.
* **Gluestack UI** `@gluestack-ui/core`: Um sistema de design para React Native que oferece componentes acessíveis e customizáveis.
* **Animações**: `@legendapp/motion` e `react-native-reanimated` para transições fluidas e gestos.

### 🌐 Conectividade & Dados
* **Axios** `axios`: Cliente HTTP para comunicação com o backend Vapor API.
* **Armazenamento Local**: `@react-native-async-storage/async-storage` e **`expo-secure-store`** para tokens de autenticação.

---

## 📦 Instalação e Execução

### Pré-requisitos
* Node.js ^18;
* Expo;
* Emulador Android/iOS ou um dispositivo físico.
* O backend **Vapor API** deve estar em execução localmente ou em produção.

### Instalação Local

1.  Clone o repositório
```bash
git clone https://github.com/augustoglago/vapor.git
cd vapor
```

2. Instale as dependências
```bash
npm install
# ou yarn install
```

3. Execute o aplicativo
```bash
npx expo start
```
---

## 👥 Equipe de Desenvolvimento

**Integrantes:**
- [Augusto Lago](https://github.com/augustoglago);
- [Erik Abdala](https://github.com/ErikAbdala);
- [Lucas Costa](https://github.com/lucas-0331);
- [Pedro Elias](https://github.com/pedrelias).

**IFSULDEMINAS - Campus Muzambinho**  
**Docente:** Hudson de Jesus Ferreira Júnior  
**Disciplina:** Tópicos Especiais II  
**Curso:** Ciência da Computação  
**Turma:** COMP8 (Noturno)