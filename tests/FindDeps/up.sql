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

create table a (
    id serial primary key,
    b text,
    a text
);

create table b (
    id serial primary key,
    a text,
    b text
);

CREATE SCHEMA test;

create table test.test (
    id serial primary key,
    test text
);

create table test.companies (
    id serial primary key,
    is_test boolean
);