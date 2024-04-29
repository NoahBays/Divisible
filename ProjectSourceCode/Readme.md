# Divisible

## Description

Divisible is a web application that allows users to manage group payments and track transaction history. It uses Express.js for the server, Handlebars for templating, and PostgreSQL for the database.

## Features

- User authentication
- Add friends
- Create and manage groups
- Track group payment history

## Setup and Installation

### Prerequisites

- Docker
- Node.js

### Installation

1. Clone the github repository
2. Install dependencies with `npm install`
3. Start the server with `npm start`

## Usage

1. Navigate to Divisible/ProjectSourceCode
2. Startup docker container with `docker compose up`
3. Open `localhost:3000/login` and login with some of the inserted dated in insert.sql, or navigate to the register page
4. When your finished, use `docker compose down --volumes` to clear your changes   

### User Authentication

- Register a new account
- Log in to an existing account

### Friends

- Add a friend by username
- View friends, see their information and profile picture

### Groups

- Create a new group, by name
- Add friends to your new group
- Navigate to a group page to view members and recent transactions

### Transactions

- Make a payment to a friend or group, paying back specific transaction name
- Thorough authentication, so you can't pay the wrong friend or group
- Add Money functionality in place of real payment API
- View transaction history in individual groups, or on the home page

## Testing

- Testing is done using chai/mocha.

## .env
## POSTGRES_USER="postgres"
## POSTGRES_PASSWORD="pwd"
## POSTGRES_DB="users_db"

## SESSION_SECRET = "secret"


