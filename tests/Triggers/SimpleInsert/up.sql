
CREATE TABLE orders (
  id serial primary key
);

CREATE TABLE units (
  id serial primary key,
  id_order integer NOT NULL REFERENCES orders
);

