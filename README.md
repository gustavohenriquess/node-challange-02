# Node Challange 02

[Documentation](https://efficient-sloth-d85.notion.site/Desafio-02-be7cdb37aaf74ba898bc6336427fa410)

## Regras da aplicação

- Deve ser possível criar um usuário
- Deve ser possível identificar o usuário entre as requisições
- Deve ser possível registrar uma refeição feita, com as seguintes informações:
    
    *As refeições devem ser relacionadas a um usuário.*
    
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
- Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição
- Deve ser possível recuperar as métricas de um usuário
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência por dia de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou


## Rotas
### User
#### Create User
- POST
- /user

#### Login
- POST
- /user/login

### Meals
#### Create Meal
- POST
- /meals

#### Get Meals
- GET
- /meals

#### Get Meal
- GET
- /meals/{id}

#### Edit Meal
- PUT
- /meals/{id}

#### Delete Meal
- DELETE
- /meals/{id}

#### Get Meal Metrics
- GET
- /meal/metrics

#### 
## Tabelas

### User
- id                  uuid
- user                text
- password            text
- sessionId           uuid
- created_At          timeStamp
- updated_At          timeStamp

### Meal
- id                  uuid
- description         text
- dateTime            timeStamp
- inDiet              boolean
- userId              string
- created_At          timeStamp
- updated_At          timeStamp