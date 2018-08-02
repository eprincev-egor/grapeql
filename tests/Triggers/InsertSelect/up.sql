
CREATE TABLE orders (
  id serial primary key
);

CREATE TABLE units (
  id serial primary key,
  id_order integer NOT NULL,
  name text not null
);

insert into orders default values;
insert into orders default values;

insert into units 
    (id_order, name)
values
    (1, 'red'),
    (1, 'green'),
    (1, 'blue');
