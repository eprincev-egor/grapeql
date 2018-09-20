create table company (
    id serial primary key,
    name text not null unique,
    inn text not null unique
);

create table orders (
    id serial primary key,
    id_client integer not null references company
);