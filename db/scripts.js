exports.modules = {
    initTables: `
        CREATE TABLE IF NOT EXISTS app_user (
            user_id serial PRIMARY KEY,
            username varchar(50) NOT NULL,
            hash varchar(500) NULL,
            salt varchar(500) NULL,
            google_id varchar(500) NULL,
            create_date TIMESTAMP default NOW()
        );
        CREATE TABLE IF NOT EXISTS app_flow (
            flow_id serial PRIMARY KEY,
            saw_blood TIMESTAMP NOT NULL,
            hefsek TIMESTAMP NOT NULL,
            mikva TIMESTAMP NOT NULL,
            day_30 TIMESTAMP NULL,
            day_31 TIMESTAMP NULL,
            haflaga TIMESTAMP NULL,
            diff_in_days INT NULL,
            before_sunset BOOLEAN NOT NULL DEFAULT FALSE,
            user_id INT,
            CONSTRAINT fk_user
                FOREIGN KEY (user_id) 
                    REFERENCES app_user (user_id)
        );
        CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON app_user (username);
        ALTER TABLE app_flow ADD COLUMN IF NOT EXISTS yom_hachodesh TIMESTAMP NULL;
    `,
    createUser: `
        INSERT INTO app_user (username, hash, salt, google_id) VALUES 
        ($1, $2, $3, $4)
        RETURNING *
    `,
    findUser: `
        Select * From app_user Where user_id = $1;
    `,
    findUserByUsername: `
        Select * From app_user Where username = $1;
    `,
    findUserByGoogleId: `
        Select * From app_user Where google_id = $1;
    `,
    createFlow: `
        INSERT INTO app_flow (saw_blood, hefsek, mikva, day_30, day_31, haflaga, yom_hachodesh, diff_in_days, before_sunset, user_id) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `,
    updateFlow: `
        UPDATE app_flow
        SET saw_blood = $2,
            hefsek = $3,
            mikva = $4,
            day_30 = $5,
            day_31 = $6,
            yom_hachodesh = $7,
            before_sunset = $8
        WHERE flow_id = $1
        RETURNING *;
    `,
    deleteFlow: `
        Delete From app_flow Where flow_id = $1;
    `,
    findFlowsByUser: `
        Select * From app_flow Where user_id = $1;
    `,
    findFlowById: `
        Select * From app_flow Where flow_id = $1;
    `

}