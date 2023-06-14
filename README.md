# Mikva
Mikva calculator PEAN (Postgres, Express.js, Angular.js, Node.js) style

See it live [here](https://mikva.fly.dev/#/home)

# Run Locally

1. Clone the project `git clone https://github.com/moshekarmel1/mikva.git && cd  mikva`
2. Set the config vars (details below)
3. Run (and/or) install Postgres
4. Run the following to start the app on port 3000 `node server`

# Config Variables

There are many different config vars, here's what they do
1. `SECRET`: is a secret value to sign jwt tokens, as its name insinuates, keep it a secret.
2. `PORT`: which port the app should run on, defaults to `3000`.
3. `DATABASE_URL`: location of the postgres database.
4. `clientID`: Google auth client ID.
5. `clientSecret`: Google auth client Secret.
6. `callbackURL`: Google auth callback URL.

