
CREATE TABLE orders (
  id serial primary key,
  units_count integer default 0 not null
);

CREATE TABLE units (
  id serial primary key,
  id_order integer NOT NULL REFERENCES orders
);

