
CREATE TABLE public.country
(
  id serial,
  name text NOT NULL,
  code text NOT NULL,
  CONSTRAINT country_pk PRIMARY KEY (id),
  CONSTRAINT country_code_uniq UNIQUE (code),
  CONSTRAINT country_name_uniq UNIQUE (name)
)
WITH (
  OIDS=FALSE
);

insert into public.country (name, code) values ('Россия', 'RU');
    
    
CREATE TABLE public.company
(
  id serial,
  name text NOT NULL,
  inn text NOT NULL,
  id_country integer NOT NULL DEFAULT 1,
  CONSTRAINT company_pk PRIMARY KEY (id),
  CONSTRAINT company_country_fk FOREIGN KEY (id_country)
      REFERENCES public.country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT company_inn_uniq UNIQUE (inn),
  CONSTRAINT company_name_uniq UNIQUE (name)
)
WITH (
  OIDS=FALSE
);


CREATE INDEX fki_company_country_fk
  ON public.company
  USING btree
  (id_country);

  
  CREATE TABLE public."order"
  (
    id serial,
    id_company_client integer NOT NULL,
    id_country_start integer NOT NULL DEFAULT 1,
    id_country_end integer NOT NULL DEFAULT 1,
    CONSTRAINT order_pk PRIMARY KEY (id),
    CONSTRAINT order_company_client_fk FOREIGN KEY (id_company_client)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT order_country_end_fk FOREIGN KEY (id_country_end)
        REFERENCES public.country (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT order_country_start_fk FOREIGN KEY (id_country_start)
        REFERENCES public.country (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
  )
  WITH (
    OIDS=FALSE
  );
  
  CREATE INDEX fki_order_company_client_fk
    ON public."order"
    USING btree
    (id_company_client);
  
  CREATE INDEX fki_order_country_end_fk
    ON public."order"
    USING btree
    (id_country_end);
  
  CREATE INDEX fki_order_country_start_fk
    ON public."order"
    USING btree
    (id_country_start);
    
    
CREATE TABLE public.order_partner_link
(
  id_order integer NOT NULL,
  id_company integer NOT NULL,
  CONSTRAINT order_partner_link_company_fk FOREIGN KEY (id_company)
      REFERENCES public.company (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT order_partner_link_order_fk FOREIGN KEY (id_order)
      REFERENCES public."order" (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT order_partner_link_uniq UNIQUE (id_order, id_company)
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
