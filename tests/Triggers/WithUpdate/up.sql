
CREATE TABLE orders (
    id serial primary key,
    name text
);

CREATE TABLE counter (
    counts integer default 0 not null,
    id_order integer unique references orders 
);
