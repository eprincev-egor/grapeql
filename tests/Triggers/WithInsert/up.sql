
CREATE TABLE orders (
  id serial primary key,
  units_names text
);

CREATE TABLE units (
  id serial primary key,
  id_order integer NOT NULL REFERENCES orders,
  name text not null unique
);

