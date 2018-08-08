create table countries (
    id serial primary key,
    name text not null unique,
    code text not null unique
);

create table companies (
    id serial primary key,
    name text not null unique,
    inn text not null unique,
    id_country integer not null references countries
);