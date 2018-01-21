# Mikva
Mikva calculator MEAN style

See it live here [http://mikva.xyz]

# Run Locally

1. Clone the project `git clone https://github.com/moshekarmel1/mikva.git && cd  mikva`
2. Set the config vars (details below)
3. Run (and/or) install mongoDB [https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/]
4. Run the following to start the app on port 3000 `node server`

# Config Variables

There are many different config vars, here's what they do
1. `SECRET`: is a secret value to sign jwt tokens, as its name insinuates, keep it a secret.
2. `PORT`: which port the app should ru on, defaults to `3000`.
3. `MONGO_URI`: location of the mongoDB database, defaults to `mongodb://127.0.0.1/flows`.
4. `clientID`: Google auth client ID.
5. `clientSecret`: Google auth client Secret.
6. `callbackURL`: Google auth callback URL.

