CREATE TABLE country
(
  id serial,
  name text NOT NULL,
  code text NOT NULL,
  CONSTRAINT country_pk PRIMARY KEY (id),
  CONSTRAINT country_code_uniq UNIQUE (code),
  CONSTRAINT country_name_uniq UNIQUE (name)
);

CREATE TABLE company
(
  id serial,
  name text NOT NULL,
  inn text NOT NULL,
  id_country integer NOT NULL DEFAULT 1,
  CONSTRAINT company_pk PRIMARY KEY (id),
  CONSTRAINT company_country_fk FOREIGN KEY (id_country)
      REFERENCES country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT company_inn_uniq UNIQUE (inn),
  CONSTRAINT company_name_uniq UNIQUE (name)
);
