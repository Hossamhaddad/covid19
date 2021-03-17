DROP TABLE IF EXISTS corona19;
CREATE TABLE corona19(
    id SERIAL PRIMARY KEY,
   country VARCHAR(255),
   totalconfirmedcases VARCHAR(255),
   totaldeathscases VARCHAR(255),
   totalrecoveredcases VARCHAR(255),
   date VARCHAR(255)
);
