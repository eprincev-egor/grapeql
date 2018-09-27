create table country (
    id serial primary key,
    code text not null unique,
    name text not null unique
);

create table company (
    id serial primary key,
    name text not null unique,
    inn text not null unique,
    manager_name text,
    id_country integer not null default 1 references country
);

create table orders (
    id serial primary key,
    id_client integer not null references company
);