CREATE TABLE public.company
(
  id serial,
  name text NOT NULL,
  inn text NOT NULL,
  CONSTRAINT company_pk PRIMARY KEY (id),
  CONSTRAINT company_inn_uniq UNIQUE (inn),
  CONSTRAINT company_name_uniq UNIQUE (name)
)
WITH (
  OIDS=FALSE
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
