
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
  id_last_order integer,
  CONSTRAINT company_pk PRIMARY KEY (id),
  CONSTRAINT company_country_fk FOREIGN KEY (id_country)
      REFERENCES public.country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT company_inn_uniq UNIQUE (inn),
  CONSTRAINT company_name_uniq UNIQUE (name)
);

CREATE TABLE public."order" (
  id serial,
  id_company_client integer NOT NULL,
  id_company_partner integer NOT NULL,
  id_country_start integer NOT NULL DEFAULT 1,
  id_country_end integer NOT NULL DEFAULT 1,
  CONSTRAINT order_pk PRIMARY KEY (id),
  CONSTRAINT order_company_client_fk FOREIGN KEY (id_company_client)
      REFERENCES public.company (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT order_company_partner_fk FOREIGN KEY (id_company_partner)
      REFERENCES public.company (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT order_country_end_fk FOREIGN KEY (id_country_end)
      REFERENCES public.country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT order_country_start_fk FOREIGN KEY (id_country_start)
      REFERENCES public.country (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);


ALTER TABLE company
  ADD CONSTRAINT company_last_order_fk FOREIGN KEY (id_last_order)
      REFERENCES public."order" (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE SET NULL;

CREATE TABLE order_sale (
    id serial,
    sale_sum numeric,
    id_order integer NOT NULL,
    CONSTRAINT order_sale_pk PRIMARY KEY (id),
    CONSTRAINT order_sale_order_fk FOREIGN KEY (id_order)
        REFERENCES public."order" (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);
