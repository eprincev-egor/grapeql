CREATE TABLE public.country
(
  id serial
)
WITH (
  OIDS=FALSE
);

CREATE TABLE public.company
(
  id serial
)
WITH (
  OIDS=FALSE
);

  CREATE TABLE public."order"
  (
    id serial
  )
  WITH (
    OIDS=FALSE
  );

CREATE SCHEMA test;

CREATE TABLE test.company
(
  id serial NOT NULL,
  CONSTRAINT company_pk PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
