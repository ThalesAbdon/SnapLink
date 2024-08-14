# SnapLink

## Sobre o Sistema

Este projeto tem como objetivo desenvolver um sistema de encurtamento de URLs, permitindo aos usuários criar URLs curtas e gerenciá-las de maneira eficiente. A principal funcionalidade do sistema é transformar URLs longas em URLs curtas e amigáveis, que podem ser facilmente compartilhadas e gerenciadas.

## Conteúdo
- [Fluxo do Sistema](#fluxo-do-sistema)
- [Arquitetura](#arquitetura)
- [Instalação e Execução](#instalação-e-execução)
- [Postgres](#postgres)
- [Testes da API](#testes-da-api)
- [Features](#features)
    - 1 [Usuários](#user)
      - 1.1 [Criar um usuario](#criar-um-usuário)
      - 1.2 [Atualizar dados](#atualizar-dados)
      - 1.3 [Deletar conta](#deletar-conta)
    - 2 [Autenticar](#auth)
      - 2.1 [Login](#logar)
    - 3 [URLs](#urls)  
      - 3.1 [Criar url](#criar-url)
      - 3.2 [Listar urls](#listar-urls)
      - 3.3 [Acessar url](#acessar-url)
      - 3.4 [Atualizar url](#atualizar-url)
      - 3.5 [Deletar url](#deletar-url)
- [Melhorias](#melhorias-futuras)      
    - 1 [Escalabilidade Horizontal](escalabilidade-horizontal)
      
      

## Fluxo do Sistema
![Flow](images/flow.gif)

 - Existem 2 tipos de usuários: o convidado e o usuário autenticado.
 - O convidado *NÃO* precisa fazer cadastro, ele consegue utilizar nosso encurtador de link, basta enviar o link que deseja encurtar e receberá como resposta o link encurtado.
 - Já o caso do usuário cadastrado, ele necessita fazer login no sistema,
 dessa forma ele consegue criar um link (encurtado), listar, editar e excluir todas URLs.
 - É importanto ressaltar que 1 usuário pode possuir N urls

## Arquitetura

Este projeto foi desenvolvido utilizando o NestJS, que segue uma arquitetura modular e organizada. Abaixo, descrevo os principais componentes da arquitetura padrão do NestJS:

###Módulos
Os módulos são a base da estrutura do NestJS. Eles ajudam a organizar o código em partes coesas e reutilizáveis. Cada módulo é uma classe decorada com @Module, que pode importar outros módulos, declarar provedores e exportar provedores para outros módulos.

###Controladores
Os controladores são responsáveis por lidar com as requisições HTTP e retornar as respostas ao cliente. Eles são decorados com @Controller e contêm manipuladores de rotas, que são métodos decorados com @Get, @Post, @Put, @Delete, entre outros.

###Serviços
Os serviços contêm a lógica de negócios e são injetados nos controladores ou em outros serviços. Eles são decorados com @Injectable e podem ser providos por módulos.

## Instalação e Execução
 
### 1. Clonar o Repositório

Clone o repositório do GitHub para sua máquina local:

```bash
git clone https://github.com/ThalesAbdon/SnapLink.git
```

### 2. Instalar Dependências
Acesse a pasta root
```
cd snap-link
```
Execute o comando:
```
npm install
```
### 3. Configurar Variáveis de Ambiente
Verifique as variavéis de ambiente no arquivo`.env.example`(esse arquivo foi deixado para facilitar os teste. Caso utilize, basta renomear para `.env`).
```
.env.example
```
### 4. Execute o script do Docker
```
sudo docker compose --env-file .env up -d
```
Dê control + C para encerrar o programa.

Caso queira dar um SHUTDOWN no docker, utilize o comando:

```
sudo docker docker compose down
```

## Testes unitários
  - Foram implementados testes unitários para garantir a qualidade do software.

  - Todas as services possuem 100% de cobertura.

![Unit Tests](images/tests.png)

## Testes da API
  Para testar, podemos usar o swagger:
  ```http://localhost/api``` ou um cliente GUI (Postman, insomnia, etc).
  
  - Podemos criar uma Url como convidado ( ou seja, sem fazer cadastro )

  - Ou podemos [Criar um usuario](#user)
  
  - Caso você crie um usuário, é necessário [Autenticar](#Auth), ou seja: logar no nosso sistema. Assim, será gerado um Bearer token e com ele poderemos ter acesso aos outros end-points. Em caso de não utilização do Bearer token em uma rota que requer autenticação, iremos receber como retorno o erro:

  ```
  {
    "message": "Forbidden resource",
    "error": "Forbidden",
    "statusCode": 403
  }
  ```

  OBS: Caso rode localmente sem docker, adicione a porta na url ao lado do localhost, por exemplo: se estiver rodando localmente na porta 3000, adicione `:3000` depois do localhost. Exemplo:
  ```http://localhost:3000/api```
# Features
##Existe uma rota para o swagger: ```http://localhost/api``` 
###porém segue abaixo algumas das funcionalidades.


## User
  - Um usuário autenticado pode criar, listar, editar o endereço de destino e excluir URLs encurtadas por ele.


### Criar um usuário  
  - É uma rota pública, ou seja: qualquer um pode criar um usuário.
  - Para criar um usuário do tipo CLIENTE, utilizamos uma rota POST:
   ```http://localhost/users``` 
   
   Segue um exemplo de como utilizar o end-point de criação de usuário:
    {
      "username": "teste",
      "email": "teste@gmail.com",
      "password": "123456"
    }

###  Atualizar dados
  - Um usuário pode atualizar seus dados
  - Para isso ele tem que estar Logado no Sistema
  - Para Logar no sistema, utilizamos uma rota POST:
    ```http://localhost/auth/login``` 
       
   Com o seguinte json:

    {
      "email": "teste@teste.com",
      "password": "123456"
    }    
    
  Como retorno, teremos um bearer token:

    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXIiOnsiaWQiOjQsIm5hbWUiOiJUaGFsZXNFcnJvIn19LCJpYXQiOjE3MjEwNjE1NDAsImV4cCI6MTcyMTA2MzM0MH0.xm_J8AYInWm4DOSmFlFC6erSIkI-aVvD5Mz98ir5_LI"
    }  

###É importante lembrar que teremos que utilizar esse token para fazer requisições nos outros endpoints. Ou seja, o usuário precisa estar logado!

###  Deletar conta
  - Um usuário pode deletar sua conta.
  - Para isso ele tem que estar Logado no Sistema
  - Para deletar a conta, deve-se utilizar a rota DELETE:
    ```http://localhost/users/``` 
       
  É na verdade um softdelete, onde iremos deixar esse usuário no banco porém ele não poderá realizar nenhuma operação de leitura ou escrita.
    
  Como retorno, teremos um bearer token:


## Auth
  - Um usuário necessita estar logado para utilizar alguns end-points
  
  - Ao logar, é gerado um token com duração de 2 horas

  - É necessário email e senha para logar no sistema.
  

### Logar
  - Para fazer login, o usuário deve utilizar a rota:
   ```http://localhost/auth/login``` 
   
   Com o seguinte json:

    {
    "email": "teste@gmail.com",
    "password": "123456"
    }

## URLS
  - Qualquer pessoa ( usuário ou convidado) pode utilizar o end-point de criação de URLs
  
  - Somente um usuário(logado) listar, editar o endereço de destino e excluir URLs encurtadas por ele.

  - 
### Criar url
  - Como dito antes, qualquer pessoa pode criar uma url encurtada. Então resolvi adotar a seguinte lógica: todo usuário autenticado pode criar um  link(original) apenas 1x. Exemplo: Digamos que temos 3 usuários autenticados e eles querem encurtar esse link: `www.google.com.br`. Então nosso sistema irá salvar 3x esse link e irá gerar urls encurtadas(diferentes) para cada um deles.

  - Se um usuário NÃO autenticado criar uma url encurtada para o link `www.google.com.br` será gerada uma url encurtada.

  - Mas e se 10000 usuários NÃO autenticados quiserem criar uma url encurtada para o mesmo link? Pensando nisso eu desenvolvi esse endpoint de forma idempotente. 

  - Não importa quantas vezes ou quantos usuários NÃO autenticados tentem criar um link encurtado para um link original, o retorno vai ser sempre o mesmo do primeiro usuário NÃO autenticado que criou a url encurtada.

  - Do mesmo modo, se um usuário autenticado tentar criar novamente um link original já existente o end-point irá retornar para ele a url encurtada já criada.

  - Dessa forma evitamos criar links repetidos (levamos em consideração repetidos: link original e userId já existentes) no banco.

  - Para resolver a geração de url encurtadas com no máximo 6 caracteres, utilizei um random que gera gera números aleatórios entre 4 e 6, assim aumentei o número possível de nanoids ( evitei usar 1,2 e 3 pois são poucas combinações e poderia ficar dando colissões desnecessárias).

  - Para criar uma url encurtada, utilizamos uma rota POST:
   ```http://localhost/users``` 

 
   Exemplo de json para criação de uma url encurtada:

    {
      "originalUrl":"https://www.google.com.br"
    }

### Listar urls
- Um usuário autenticado pode listar suas PRÓPIAS URLS, assim ele poderá saber quais urls ele tem cadastrado.

Para listar todas as urls,utilizamos uma rota GET:
```http://localhost/all-urls/```

### Acessar url
- Qualquer usário ( autenticado ou não) pode acessar qualquer url encurtada do nosso sistema.

Para acessar uma url,utilizamos uma rota GET:
```http://localhost/418AQ```

### Atualizar url

- Apenas usuários autenticados podem atualizar suas urls, ou seja: podem trocar a url original por uma nova e manter o mesmo link encurtado.

Para atualizar uma url,utilizamos uma rota PATCH:
```http://localhost:3001/update-url```

### Deletar url

- Apenas usuários autenticados podem deletar suas urls.

Para deletar uma url,utilizamos uma rota Delete:
```http://localhost:3001/:id```

#  Melhorias Futuras

## Expiração de URLs
#### Permitir que os usuários definam uma data de expiração para as URLs encurtadas.

## Nanoid
#### À medida que o projeto cresce, será necessário aumentar o tamanho do nanoid para suportar um maior número de URLs.

## Análise de Cliques: 
#### Fornecer análises detalhadas sobre os cliques nas URLs encurtadas, como localização geográfica e dispositivos usados.

## Microserviços: 
#### Dividir a aplicação em microserviços para facilitar a escalabilidade e manutenção. Por exemplo, separar o serviço de encurtamento de URLs do serviço de autenticação.

## Balanceamento de Carga: 
#### Implementar um balanceador de carga para distribuir o tráfego entre várias instâncias do serviço.

## Cache: 
#### Utilizar caching para melhorar a performance, especialmente para URLs populares.

## Otimização de Banco de Dados: 
#### Implementar índices e otimizações no banco de dados para melhorar a velocidade das consultas.

## Rate Limiting: 
#### Implementar rate limiting para evitar abusos do sistema de encurtamento de URLs.

