create table companies (
    id serial primary key,
    name text not null unique,
    inn text not null unique
);