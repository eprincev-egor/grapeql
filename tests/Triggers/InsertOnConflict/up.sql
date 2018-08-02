
CREATE TABLE orders (
  id serial primary key
);

CREATE TABLE units (
  id serial primary key,
  id_order integer NOT NULL references orders,
  name text not null
);

insert into orders default values;
insert into orders default values;
