CREATE TABLE country (
  id serial,
  name text NOT NULL,
  code text NOT NULL,
  CONSTRAINT country_pk PRIMARY KEY (id),
  CONSTRAINT country_code_uniq UNIQUE (code),
  CONSTRAINT country_name_uniq UNIQUE (name)
);

CREATE TABLE company (
  id serial,
  name text NOT NULL,
  inn text NOT NULL,
  id_country integer NOT NULL DEFAULT 1,
  is_client boolean,
  some_date date,
  some_timestamp timestamp without time zone,
  CONSTRAINT company_pk PRIMARY KEY (id),
  CONSTRAINT company_country_fk FOREIGN KEY (id_country)
      REFERENCES public.country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT company_inn_uniq UNIQUE (inn),
  CONSTRAINT company_name_uniq UNIQUE (name)
);


CREATE SCHEMA test;

CREATE TABLE test.company
(
  id serial NOT NULL,
  is_some smallint NOT NULL,
  CONSTRAINT country_pk PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
