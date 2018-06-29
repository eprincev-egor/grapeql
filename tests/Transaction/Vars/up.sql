CREATE TABLE public.country
(
  id serial,
  name text,
  code text,
  population integer,
  CONSTRAINT country_pk PRIMARY KEY (id),
  CONSTRAINT country_code_uniq UNIQUE (code),
  CONSTRAINT country_name_uniq UNIQUE (name)
);
